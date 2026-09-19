const hero = document.querySelector('.hero');
const reveal = document.querySelector('.reveal');
const finePointer = matchMedia('(hover: hover) and (pointer: fine)');
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
let x = 0, y = 0, targetX = 0, targetY = 0, active = false, frame = 0;
function paint() {
  frame = 0;
  x += (targetX - x) * .22;
  y += (targetY - y) * .22;
  const position = `${x - 55}px ${y - 70}px`;
  reveal.style.maskPosition = position;
  reveal.style.webkitMaskPosition = position;
  if (active && Math.hypot(targetX - x, targetY - y) >= .3) frame = requestAnimationFrame(paint);
}
hero.addEventListener('pointermove', (event) => {
  if (!finePointer.matches || event.pointerType === 'touch') return;
  const bounds = hero.getBoundingClientRect();
  targetX = event.clientX - bounds.left;
  targetY = event.clientY - bounds.top;
  if (!active || reducedMotion.matches) { x = targetX; y = targetY; }
  active = true;
  reveal.style.opacity = '1';
  if (!frame) frame = requestAnimationFrame(paint);
});
function reset() { active = false; reveal.style.opacity = '0'; cancelAnimationFrame(frame); frame = 0; }
hero.addEventListener('pointerleave', reset);
finePointer.addEventListener('change', reset);
window.addEventListener('blur', reset);

// Chapters are readable by default; motion is an optional enhancement.
const chapterSections = [...document.querySelectorAll('.chapter[id]')];
const sectionLinks = [...document.querySelectorAll('.nav-links a')];
const chapterNav = document.querySelector('.chapter-nav');
const fileTabList = document.querySelector('.file-tabs');
const progressBar = document.querySelector('.reading-progress');
const ribbon = document.querySelector('.interlude');
const ribbonTrack = document.querySelector('.interlude-track');
const star = document.querySelector('.big-star');
const entranceElements = [...document.querySelectorAll('[data-enter]')];
let entranceObserver;

function configureMotion() {
  entranceObserver?.disconnect();
  document.documentElement.classList.toggle('motion-ready', !reducedMotion.matches);
  if (reducedMotion.matches) {
    entranceElements.forEach(element => element.classList.add('has-entered'));
    return;
  }
  entranceObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('has-entered');
      entranceObserver.unobserve(entry.target);
    });
  }, { threshold: 0, rootMargin: '0px 0px -35px 0px' });
  entranceElements.forEach(element => {
    if (element.getBoundingClientRect().top < innerHeight) element.classList.add('has-entered');
    else if (!element.classList.contains('has-entered')) entranceObserver.observe(element);
  });
}
configureMotion();
reducedMotion.addEventListener('change', configureMotion);

let scrollFrame = 0;
function updateReadingPosition() {
  scrollFrame = 0;
  const navHeight = chapterNav.offsetHeight;
  fileTabList.setAttribute('aria-orientation', innerWidth <= 560 ? 'horizontal' : 'vertical');
  const viewportHeight = innerHeight;
  const contentStart = hero.offsetHeight;
  const maxScroll = document.documentElement.scrollHeight - viewportHeight;
  const fraction = Math.max(0, Math.min(1, (scrollY - contentStart) / Math.max(1, maxScroll - contentStart)));
  progressBar.style.transform = `scaleX(${fraction})`;
  let current = null;
  chapterSections.forEach(section => {
    if (section.getBoundingClientRect().top <= navHeight + 100) current = section.id;
  });
  sectionLinks.forEach(link => {
    const linkTarget = link.hash ? link.hash.slice(1) : link.getAttribute('data-modal-target');
    if (linkTarget === current) link.setAttribute('aria-current', 'location');
    else link.removeAttribute('aria-current');
  });
  if (!reducedMotion.matches) {
    const ribbonBounds = ribbon.getBoundingClientRect();
    if (ribbonBounds.top < viewportHeight && ribbonBounds.bottom > 0) {
      const travel = Math.max(0, ribbonTrack.scrollWidth - ribbon.clientWidth);
      const position = (viewportHeight - ribbonBounds.top) / (viewportHeight + ribbonBounds.height);
      ribbonTrack.style.setProperty('--ribbon-offset', `${-Math.min(travel, 350) * position}px`);
    }
    const starBounds = star.getBoundingClientRect();
    if (starBounds.top < viewportHeight && starBounds.bottom > 0) {
      star.style.setProperty('--star-rotation', `${(viewportHeight - starBounds.top) * .07}deg`);
    }
  }
}
function scheduleReadingUpdate() {
  if (!scrollFrame) scrollFrame = requestAnimationFrame(updateReadingPosition);
}
addEventListener('scroll', scheduleReadingUpdate, { passive: true });
addEventListener('resize', scheduleReadingUpdate, { passive: true });
addEventListener('load', scheduleReadingUpdate);
document.querySelectorAll('.past-role').forEach(details => details.addEventListener('toggle', scheduleReadingUpdate));
updateReadingPosition();

// Native-button tabs: click, arrows, Home and End all select the same panel.
const fileTabs = [...document.querySelectorAll('[role="tab"]')];
function selectFile(tab, moveFocus = false) {
  fileTabs.forEach(candidate => {
    const selected = candidate === tab;
    candidate.setAttribute('aria-selected', String(selected));
    candidate.tabIndex = selected ? 0 : -1;
    document.getElementById(candidate.getAttribute('aria-controls')).hidden = !selected;
  });
  if (moveFocus) tab.focus({ preventScroll: true });
}
fileTabs.forEach((tab, index) => {
  tab.addEventListener('click', () => selectFile(tab));
  tab.addEventListener('keydown', event => {
    let next;
    if (event.key === 'ArrowRight' || event.key === 'ArrowDown') next = (index + 1) % fileTabs.length;
    if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') next = (index - 1 + fileTabs.length) % fileTabs.length;
    if (event.key === 'Home') next = 0;
    if (event.key === 'End') next = fileTabs.length - 1;
    if (next === undefined) return;
    event.preventDefault();
    selectFile(fileTabs[next], true);
  });
});

// The homepage doubles as a launchpad. Each section can be explored in a focused,
// native dialog without losing the full-page fallback underneath.
const contentModal = document.querySelector('#content-modal');
const modalBody = contentModal?.querySelector('[data-modal-body]');
const modalTitle = contentModal?.querySelector('#modal-title');
const modalClose = contentModal?.querySelector('[data-modal-close]');
const modalLabels = {
  'sobre-mi': 'perspectiva',
  proyectos: 'laboratorio abierto',
  recorrido: 'recorrido',
  herramientas: 'stack & curiosidad',
  contacto: 'la siguiente conversación'
};
let lastModalTrigger = null;

function namespaceClone(root, suffix) {
  const ids = [...root.querySelectorAll('[id]')];
  const replacements = new Map(ids.map(element => [element.id, `${element.id}-${suffix}`]));
  ids.forEach(element => { element.id = replacements.get(element.id); });
  root.querySelectorAll('[aria-controls]').forEach(element => {
    const next = replacements.get(element.getAttribute('aria-controls'));
    if (next) element.setAttribute('aria-controls', next);
  });
  root.querySelectorAll('[aria-labelledby]').forEach(element => {
    const next = replacements.get(element.getAttribute('aria-labelledby'));
    if (next) element.setAttribute('aria-labelledby', next);
  });
}

function setupModalTabs(root) {
  const tabs = [...root.querySelectorAll('[role="tab"]')];
  const select = (tab, moveFocus = false) => {
    tabs.forEach(candidate => {
      const selected = candidate === tab;
      candidate.setAttribute('aria-selected', String(selected));
      candidate.tabIndex = selected ? 0 : -1;
      const panel = root.querySelector(`[id="${candidate.getAttribute('aria-controls')}"]`);
      if (panel) panel.hidden = !selected;
    });
    if (moveFocus) tab.focus({ preventScroll: true });
  };
  tabs.forEach((tab, index) => {
    tab.addEventListener('click', () => select(tab));
    tab.addEventListener('keydown', event => {
      let next;
      if (event.key === 'ArrowRight' || event.key === 'ArrowDown') next = (index + 1) % tabs.length;
      if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') next = (index - 1 + tabs.length) % tabs.length;
      if (event.key === 'Home') next = 0;
      if (event.key === 'End') next = tabs.length - 1;
      if (next === undefined) return;
      event.preventDefault();
      select(tabs[next], true);
    });
  });
}

function openContentModal(id, trigger) {
  if (!contentModal || !modalBody) return;
  const source = document.getElementById(id);
  if (!source) return;
  const clone = source.cloneNode(true);
  clone.removeAttribute('id');
  namespaceClone(clone, 'modal');
  modalBody.replaceChildren(clone);
  modalTitle.textContent = modalLabels[id] || 'explorar';
  setupModalTabs(clone);
  lastModalTrigger = trigger;
  sectionLinks.forEach(link => {
    if (link.getAttribute('data-modal-target') === id) link.setAttribute('aria-current', 'location');
    else link.removeAttribute('aria-current');
  });
  if (!contentModal.open) contentModal.showModal();
  document.body.classList.add('modal-is-open');
  modalClose?.focus({ preventScroll: true });
}

function closeContentModal() {
  if (!contentModal?.open) return;
  contentModal.close();
}

document.addEventListener('click', event => {
  const trigger = event.target.closest('[data-modal-target]');
  if (!trigger) return;
  const id = trigger.getAttribute('data-modal-target');
  if (!document.getElementById(id)) return;
  event.preventDefault();
  openContentModal(id, trigger);
});
modalClose?.addEventListener('click', closeContentModal);
contentModal?.addEventListener('click', event => {
  if (event.target === contentModal) closeContentModal();
});
contentModal?.addEventListener('close', () => {
  document.body.classList.remove('modal-is-open');
  modalBody?.replaceChildren();
  lastModalTrigger?.focus({ preventScroll: true });
});
