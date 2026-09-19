const hero = document.querySelector('.hero');
const dialog = document.querySelector('#content-modal');
const modalBody = dialog.querySelector('[data-modal-body]');
const modalTitle = dialog.querySelector('#modal-title');
const closeButton = dialog.querySelector('[data-modal-close]');
const preview = document.querySelector('#scene-preview');
const points = [...document.querySelectorAll('[data-preview]')];
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
const finePointer = matchMedia('(hover: hover) and (pointer: fine)');
const chapters = new Map([...document.querySelectorAll('main > .chapter')].map(section => [section.id, section]));
const homes = new Map();
const copy = {
  'sobre-mi': ['01 / perspectiva', 'el criterio detrás del código.', 'personas, producto y agentes de ia. cómo conecto lo que aprendo con lo que construyo.', 'explorar mi perspectiva'],
  proyectos: ['02 / laboratorio abierto', 'ideas que ya tienen código.', 'agentes con memoria, límites para la autonomía y pequeñas automatizaciones. tres proyectos para explorar.', 'entrar al laboratorio'],
  recorrido: ['03 / recorrido', 'cada etapa deja algo.', 'de liderar equipos a desarrollar producto en resizes. las experiencias que dan forma a mi manera de trabajar.', 'ver el recorrido'],
  herramientas: ['04 / stack', 'las herramientas. el criterio.', 'typescript, vue, python y un entorno de desarrollo con codex, cursor y claude code. siempre en evolución.', 'explorar el stack'],
  contacto: ['05 / hablemos', 'una conversación puede ser el inicio.', 'producto, desarrollo o agentes de ia. encuentra mi correo y mis perfiles para seguir la conversación.', 'abrir contacto']
};
let selected = '', currentSection = null, lastFocus = null;
let hideTimer, portalAnimation, closing = false;
preview.hidden = true;
points.forEach(point => {
  point.setAttribute('aria-label', point.querySelector('.point-label').textContent.replace('↗', '').trim());
  point.querySelector('.point-label i')?.remove();
});
function hidePreview() {
  clearTimeout(hideTimer);
  preview.hidden = true;
  points.forEach(point => point.setAttribute('aria-expanded', 'false'));
}
function scheduleHide() {
  clearTimeout(hideTimer);
  hideTimer = setTimeout(() => {
    if (!preview.matches(':hover') && !preview.contains(document.activeElement) && !points.some(point => point.matches(':hover'))) hidePreview();
  }, 250);
}
function placePreview() {
  const point = points.find(point => point.dataset.preview === selected);
  if (!point) return;
  const rect = point.getBoundingClientRect();
  const width = preview.offsetWidth, height = preview.offsetHeight;
  if (innerWidth <= 1000) {
    preview.style.left = `${(innerWidth - width) / 2}px`;
    preview.style.top = `${innerHeight - height - 65}px`;
    return;
  }
  const left = rect.x + rect.width / 2 < innerWidth / 2 ? rect.left - width - 12 : rect.right + 12;
  preview.style.left = `${Math.max(16, Math.min(innerWidth - width - 16, left))}px`;
  preview.style.top = `${Math.max(80, Math.min(innerHeight - height - 65, rect.top - 35))}px`;
}
preview.addEventListener('pointerenter', () => clearTimeout(hideTimer));
preview.addEventListener('pointerleave', scheduleHide);
preview.addEventListener('focusout', scheduleHide);
addEventListener('resize', () => { if (!preview.hidden) placePreview(); });
chapters.forEach(section => {
  const marker = document.createComment(`home: ${section.id}`);
  section.before(marker);
  homes.set(section.id, marker);
});
document.documentElement.classList.add('scene-ready');
// Remove decorative link arrows while retaining diagrams that explain a flow.
document.querySelectorAll('a, h1, h2, .motion-toggle, .stack-number').forEach(element => {
  const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT);
  while (walker.nextNode()) walker.currentNode.textContent = walker.currentNode.textContent.replace(/[↗↘↑↓]/g, '').trimEnd();
});
document.querySelectorAll('.arrow-link').forEach(link => { link.textContent = 'ver'; });
document.querySelector('.colophon a[href="#inicio"]').textContent = 'volver al retrato';

function selectPreview(id) {
  if (!copy[id]) return;
  clearTimeout(hideTimer);
  preview.hidden = false;
  selected = id;
  const [index, title, description, action] = copy[id];
  preview.querySelector('.preview-index').textContent = index;
  preview.querySelector('.preview-title').textContent = title;
  preview.querySelector('.preview-copy').textContent = description;
  const button = preview.querySelector('.preview-open');
  button.dataset.modalTarget = id;
  button.replaceChildren(document.createTextNode(action + ' '));
  points.forEach(point => point.setAttribute('aria-expanded', String(point.dataset.preview === id)));
  preview.classList.remove('is-changing');
  requestAnimationFrame(() => preview.classList.add('is-changing'));
  placePreview();
}
points.forEach(point => {
  point.addEventListener('pointerenter', event => { if (event.pointerType !== 'touch') selectPreview(point.dataset.preview); });
  point.addEventListener('focus', () => selectPreview(point.dataset.preview));
  point.addEventListener('click', () => selectPreview(point.dataset.preview));
  point.addEventListener('pointerleave', scheduleHide);
  point.addEventListener('blur', scheduleHide);
  point.addEventListener('keydown', event => {
    if (event.key !== 'ArrowDown') return;
    event.preventDefault(); preview.querySelector('button').focus();
  });
});

function returnSection() {
  if (!currentSection) return;
  homes.get(currentSection.id).after(currentSection);
  currentSection = null;
}
function openSection(id, trigger, updateHistory = true) {
  if (!chapters.has(id)) return;
  selectPreview(id);
  closing = false;
  portalAnimation?.cancel();
  const origin = points.find(point => point.dataset.preview === id).getBoundingClientRect();
  dialog.style.setProperty('--portal-x', `${origin.x + origin.width / 2}px`);
  dialog.style.setProperty('--portal-y', `${origin.y + origin.height / 2}px`);
  returnSection();
  currentSection = chapters.get(id);
  modalBody.replaceChildren(currentSection);
  modalTitle.textContent = copy[id][0];
  if (!dialog.open) lastFocus = trigger || document.activeElement;
  dialog.showModal();
  hidePreview();
  if (!reducedMotion.matches) portalAnimation = dialog.animate([
    { clipPath: 'circle(8px at var(--portal-x) var(--portal-y))', opacity: .4 },
    { clipPath: 'circle(150vmax at var(--portal-x) var(--portal-y))', opacity: 1 }
  ], { duration: 850, easing: 'cubic-bezier(.22,1,.36,1)' });
  modalBody.scrollTop = 0;
  document.body.classList.add('modal-is-open');
  if (updateHistory) history.pushState({ portraitModal: true }, '', `#${id}`);
  closeButton.focus({ preventScroll: true });
}
async function closeSection(updateHistory = true) {
  if (!dialog.open || closing) return;
  closing = true;
  portalAnimation?.cancel();
  if (!reducedMotion.matches) {
    portalAnimation = dialog.animate([
      { clipPath: 'circle(150vmax at var(--portal-x) var(--portal-y))', opacity: 1 },
      { clipPath: 'circle(8px at var(--portal-x) var(--portal-y))', opacity: 0 }
    ], { duration: 430, easing: 'cubic-bezier(.65,0,.8,.3)', fill: 'forwards' });
    try { await portalAnimation.finished; } catch { return; }
  }
  dialog.close();
  portalAnimation?.cancel();
  closing = false;
  returnSection();
  document.body.classList.remove('modal-is-open');
  if (updateHistory) {
    if (history.state?.portraitModal) history.back();
    else history.replaceState(null, '', location.pathname + location.search);
  }
  const point = points.find(point => point.dataset.preview === selected);
  (point || lastFocus)?.focus({ preventScroll: true });
  hidePreview();
}
document.addEventListener('click', event => {
  if (!event.target.closest('.face-point, .scene-preview') && !dialog.open) hidePreview();
  const trigger = event.target.closest('[data-modal-target]');
  if (trigger && chapters.has(trigger.dataset.modalTarget)) {
    event.preventDefault(); openSection(trigger.dataset.modalTarget, trigger);
  }
  if (dialog.open && event.target.closest('a[href="#inicio"]')) { event.preventDefault(); closeSection(); }
});
document.addEventListener('keydown', event => { if (event.key === 'Escape' && !dialog.open) hidePreview(); });
closeButton.addEventListener('click', () => closeSection());
dialog.addEventListener('cancel', event => { event.preventDefault(); closeSection(); });
dialog.addEventListener('click', event => { if (event.target === dialog) closeSection(); });
function syncRoute() {
  const id = location.hash.slice(1);
  if (chapters.has(id)) openSection(id, null, false);
  else closeSection(false);
}
addEventListener('popstate', syncRoute);
addEventListener('hashchange', () => { if (currentSection?.id !== location.hash.slice(1)) syncRoute(); });
syncRoute();

// One copy of each chapter: all interactions persist when moved into the dialog.
document.querySelectorAll('[role="tablist"]').forEach(list => {
  const tabs = [...list.querySelectorAll('[role="tab"]')];
  function select(tab, focus = false) {
    tabs.forEach(candidate => {
      const active = candidate === tab;
      candidate.setAttribute('aria-selected', String(active)); candidate.tabIndex = active ? 0 : -1;
      document.getElementById(candidate.getAttribute('aria-controls')).hidden = !active;
    });
    if (focus) tab.focus();
  }
  tabs.forEach((tab, index) => {
    tab.addEventListener('click', () => select(tab));
    tab.addEventListener('keydown', event => {
      let next;
      if (['ArrowRight', 'ArrowDown'].includes(event.key)) next = (index + 1) % tabs.length;
      if (['ArrowLeft', 'ArrowUp'].includes(event.key)) next = (index + tabs.length - 1) % tabs.length;
      if (event.key === 'Home') next = 0;
      if (event.key === 'End') next = tabs.length - 1;
      if (next === undefined) return;
      event.preventDefault(); select(tabs[next], true);
    });
  });
});
const motionButton = document.querySelector('.motion-toggle');
motionButton.addEventListener('click', () => {
  const paused = document.documentElement.classList.toggle('motion-paused');
  motionButton.setAttribute('aria-pressed', String(paused));
  motionButton.textContent = paused ? 'activar movimiento' : 'pausar movimiento';
});
hero.addEventListener('pointermove', event => {
  if (!finePointer.matches || reducedMotion.matches || document.documentElement.classList.contains('motion-paused')) return;
  hero.style.setProperty('--portrait-x', `${(event.clientX / innerWidth - .5) * 7}px`);
  hero.style.setProperty('--portrait-y', `${(event.clientY / innerHeight - .5) * 4}px`);
});
function resetMotion() { hero.style.setProperty('--portrait-x', '0px'); hero.style.setProperty('--portrait-y', '0px'); }
hero.addEventListener('pointerleave', resetMotion);
reducedMotion.addEventListener('change', resetMotion);
