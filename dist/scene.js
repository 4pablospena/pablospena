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
chapters.forEach(section => {
  const marker = document.createComment(`home: ${section.id}`);
  section.before(marker);
  homes.set(section.id, marker);
});
document.documentElement.classList.add('scene-ready');

function selectPreview(id) {
  if (!copy[id] || selected === id) return;
  selected = id;
  const [index, title, description, action] = copy[id];
  preview.querySelector('.preview-index').textContent = index;
  preview.querySelector('.preview-title').textContent = title;
  preview.querySelector('.preview-copy').textContent = description;
  const button = preview.querySelector('.preview-open');
  button.dataset.modalTarget = id;
  button.replaceChildren(document.createTextNode(action + ' '));
  const arrow = document.createElement('span');
  arrow.textContent = '↗'; arrow.setAttribute('aria-hidden', 'true'); button.append(arrow);
  points.forEach(point => point.setAttribute('aria-expanded', String(point.dataset.preview === id)));
  preview.classList.remove('is-changing');
  requestAnimationFrame(() => preview.classList.add('is-changing'));
}
points.forEach(point => {
  point.addEventListener('pointerenter', event => { if (event.pointerType !== 'touch') selectPreview(point.dataset.preview); });
  point.addEventListener('focus', () => selectPreview(point.dataset.preview));
  point.addEventListener('click', () => selectPreview(point.dataset.preview));
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
  returnSection();
  currentSection = chapters.get(id);
  modalBody.replaceChildren(currentSection);
  modalTitle.textContent = copy[id][0];
  if (!dialog.open) lastFocus = trigger || document.activeElement;
  dialog.showModal();
  modalBody.scrollTop = 0;
  document.body.classList.add('modal-is-open');
  if (updateHistory) history.pushState({ portraitModal: true }, '', `#${id}`);
  closeButton.focus({ preventScroll: true });
}
function closeSection(updateHistory = true) {
  if (!dialog.open) return;
  dialog.close();
  returnSection();
  document.body.classList.remove('modal-is-open');
  if (updateHistory) {
    if (history.state?.portraitModal) history.back();
    else history.replaceState(null, '', location.pathname + location.search);
  }
  if (lastFocus?.isConnected) lastFocus.focus({ preventScroll: true });
}
document.addEventListener('click', event => {
  const trigger = event.target.closest('[data-modal-target]');
  if (trigger && chapters.has(trigger.dataset.modalTarget)) {
    event.preventDefault(); openSection(trigger.dataset.modalTarget, trigger);
  }
  if (dialog.open && event.target.closest('a[href="#inicio"]')) { event.preventDefault(); closeSection(); }
});
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
  motionButton.textContent = paused ? 'activar movimiento ↗' : 'pausar movimiento Ⅱ';
});
hero.addEventListener('pointermove', event => {
  if (!finePointer.matches || reducedMotion.matches || document.documentElement.classList.contains('motion-paused')) return;
  hero.style.setProperty('--portrait-x', `${(event.clientX / innerWidth - .5) * 7}px`);
  hero.style.setProperty('--portrait-y', `${(event.clientY / innerHeight - .5) * 4}px`);
});
function resetMotion() { hero.style.setProperty('--portrait-x', '0px'); hero.style.setProperty('--portrait-y', '0px'); }
hero.addEventListener('pointerleave', resetMotion);
reducedMotion.addEventListener('change', resetMotion);
