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
  document.body.classList.remove('preview-is-open');
  points.forEach(point => point.setAttribute('aria-expanded', 'false'));
}
function scheduleHide() {
  clearTimeout(hideTimer);
  hideTimer = setTimeout(() => {
    if (!preview.matches(':hover') && !preview.contains(document.activeElement) && !points.some(point => point.matches(':hover'))) hidePreview();
  }, 650);
}
function placePreview() {
  const point = points.find(point => point.dataset.preview === selected);
  if (!point) return;
  const rect = point.getBoundingClientRect();
  const width = preview.offsetWidth, height = preview.offsetHeight;
  if (innerWidth <= 1000 && innerHeight > 500) {
    preview.style.left = `${(innerWidth - width) / 2}px`;
    preview.style.top = `${innerHeight - height - 65}px`;
    return;
  }
  preview.style.left = '42px';
  preview.style.top = `${Math.max(100, (innerHeight - height) / 2)}px`;
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
  document.body.classList.add('preview-is-open');
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
  point.addEventListener('pointerenter', event => { if (event.pointerType !== 'touch' && !dialog.open) selectPreview(point.dataset.preview); });
  point.addEventListener('focus', () => { if (!dialog.open) selectPreview(point.dataset.preview); });
  point.addEventListener('click', () => {
    if (dialog.open) { openSection(point.dataset.preview, point, false); history.replaceState(history.state, '', `#${point.dataset.preview}`); }
    else selectPreview(point.dataset.preview);
  });
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
  renderDeck(id);
  modalTitle.textContent = copy[id][0];
  if (!dialog.open) lastFocus = trigger || document.activeElement;
  if (!dialog.open) dialog.show();
  hidePreview();
  if (!reducedMotion.matches) portalAnimation = dialog.animate([
    { transform: 'translateX(35px) scale(.96)', opacity: 0 },
    { transform: 'translateX(0) scale(1)', opacity: 1 }
  ], { duration: 550, easing: 'cubic-bezier(.22,1,.36,1)' });
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
      { transform: 'translateX(0) scale(1)', opacity: 1 },
      { transform: 'translateX(35px) scale(.96)', opacity: 0 }
    ], { duration: 250, easing: 'ease-in', fill: 'forwards' });
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
document.addEventListener('keydown', event => { if (event.key === 'Escape') { if (dialog.open) closeSection(); else hidePreview(); } });
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
const deckContent = {
  'sobre-mi': [
    ['producto', 'primero, el problema.', 'vengo de trabajar con personas y liderar equipos. antes de escribir código, quiero entender qué necesita quien lo va a usar.'],
    ['desarrollo', 'de entender a construir.', 'en resizes desarrollo producto y amplío mi conocimiento de plataforma. aprender, probar y mejorar forman parte del mismo trabajo.'],
    ['agentes', 'autonomía con criterio.', 'me interesa dar a los agentes contexto, memoria y límites. que la ia resuelva tareas reales y deje espacio para lo que requiere una persona.']
  ],
  proyectos: [
    ['agentes', 'un agente. siete archivos.', 'build your agents organiza identidad, memoria, contexto y herramientas en una especificación abierta. construido con vue y nuxt.', 'explorar el proyecto', 'https://github.com/4pablospena/build-your-agents'],
    ['seguridad', 'antes de actuar, revisar.', 'agentic action firewall inspecciona las acciones de un agente antes de ejecutarlas. reglas de autorización en typescript. proyecto en pre-alpha.', 'ver el código', 'https://github.com/4pablospena/agentic-action-firewall'],
    ['automatización', 'lo repetitivo, resuelto.', 'una herramienta en python para convertir facturas de excel a pdf. una tarea concreta, menos trabajo manual.', 'ver la herramienta', 'https://github.com/4pablospena/facturas-excel-pdf']
  ],
  recorrido: [
    ['resizes', 'producto + ai.', 'desde diciembre de 2025, product & ai engineer. foco en desarrollo, aprendizaje de plataforma y exploración constante de agentes.'],
    ['fútbol emotion', 'liderar también es escuchar.', 'floor manager en parque principado desde noviembre de 2023, antes de resizes. liderazgo, formación, stock y análisis de objetivos con power bi.'],
    ['decathlon', 'entender a quien tienes delante.', 'vendedor deportivo en gijón en 2023. asesoramiento técnico y atención personalizada: escuchar antes de proponer.'],
    ['formación', 'seguir aprendiendo.', 'ingeniería informática en la uned. formación en javascript y responsive web design en 2025. técnico deportivo de fútbol sala, básico y avanzado.']
  ],
  herramientas: [
    ['desarrollo', 'con qué construyo.', 'typescript, javascript, vue, nuxt, python, html, css y sql. herramientas presentes en mis proyectos y formación.'],
    ['con ia', 'un entorno para explorar.', 'codex, cursor y claude code en el desarrollo. git, github y bash para trabajar con el código y su evolución.'],
    ['curiosidad', 'lo que viene después.', 'agentes con contexto, memoria y herramientas. plataforma y automatización. preguntas que convierto en nuevos experimentos.']
  ],
  contacto: [
    ['email', 'empecemos por una idea.', '¿producto, desarrollo o agentes de ia? escríbeme y hablamos.', 'escribir un correo', 'mailto:pablosuarezpena4it@outlook.com'],
    ['linkedin', 'sigamos en contacto.', 'mi trayectoria y un lugar para conectar alrededor de lo que estamos construyendo.', 'abrir linkedin', 'https://www.linkedin.com/in/pablospena/'],
    ['github', 'el código está abierto.', 'proyectos personales, experimentos y aprendizaje. lo que voy construyendo, a la vista.', 'explorar github', 'https://github.com/4pablospena']
  ]
};
function renderDeck(id) {
  const cards = deckContent[id];
  let index = 0;
  const root = document.createElement('div'); root.className = 'portrait-deck';
  const nav = document.createElement('nav'); nav.className = 'deck-tabs'; nav.setAttribute('aria-label', 'Explorar este contenido');
  const article = document.createElement('article'); article.className = 'deck-card'; article.setAttribute('aria-live', 'polite'); article.tabIndex = 0; article.setAttribute('aria-label', 'Contenido de la ficha');
  const foot = document.createElement('div'); foot.className = 'deck-controls';
  const prev = document.createElement('button'); prev.textContent = 'anterior'; prev.type = 'button';
  const count = document.createElement('span');
  const next = document.createElement('button'); next.textContent = 'siguiente'; next.type = 'button';
  function show(i) {
    index = i;
    const [label, title, description, linkLabel, href] = cards[index];
    article.replaceChildren();
    const heading = document.createElement('h2'); heading.textContent = title;
    const text = document.createElement('p'); text.textContent = description;
    article.append(heading, text);
    if (href) {
      const link = document.createElement('a'); link.href = href; link.textContent = linkLabel;
      if (href.startsWith('https:')) { link.target = '_blank'; link.rel = 'noopener noreferrer'; }
      article.append(link);
    }
    [...nav.children].forEach((button, n) => button.setAttribute('aria-pressed', String(n === index)));
    count.textContent = `${String(index + 1).padStart(2, '0')} / ${String(cards.length).padStart(2, '0')}`;
    root.style.setProperty('--deck-progress', `${(index + 1) / cards.length * 100}%`);
    prev.disabled = index === 0; next.disabled = index === cards.length - 1;
    if (!reducedMotion.matches) article.animate([{ opacity: .2, transform: 'translateY(9px)' }, { opacity: 1, transform: 'none' }], { duration: 280 });
    modalBody.scrollTop = 0;
    article.scrollTop = 0;
  }
  cards.forEach((card, i) => {
    const button = document.createElement('button'); button.type = 'button'; button.textContent = card[0]; button.addEventListener('click', () => show(i)); nav.append(button);
    button.addEventListener('keydown', event => {
      let nextIndex;
      if (event.key === 'ArrowRight') nextIndex = (i + 1) % cards.length;
      if (event.key === 'ArrowLeft') nextIndex = (i + cards.length - 1) % cards.length;
      if (event.key === 'Home') nextIndex = 0;
      if (event.key === 'End') nextIndex = cards.length - 1;
      if (nextIndex === undefined) return;
      event.preventDefault(); show(nextIndex); nav.children[nextIndex].focus();
    });
  });
  prev.addEventListener('click', () => show(index - 1)); next.addEventListener('click', () => show(index + 1));
  foot.append(prev, count, next); root.append(nav, article, foot); modalBody.replaceChildren(root); show(0);
}
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

// The warm reveal is masked in image coordinates so it stays aligned with the
// moving portrait. The light remains usable while a side panel is open.
const light = document.querySelector('.reveal');
let lightX = 0, lightY = 0, lightTargetX = 0, lightTargetY = 0, lightFrame = 0, lightActive = false;
function paintLight() {
  lightFrame = 0;
  lightX += (lightTargetX - lightX) * .22; lightY += (lightTargetY - lightY) * .22;
  light.style.setProperty('--light-x', `${lightX}px`); light.style.setProperty('--light-y', `${lightY}px`);
  if (lightActive && Math.hypot(lightTargetX - lightX, lightTargetY - lightY) > .3) lightFrame = requestAnimationFrame(paintLight);
}
hero.addEventListener('pointermove', event => {
  if (!finePointer.matches || event.pointerType === 'touch') return;
  const bounds = light.getBoundingClientRect();
  lightTargetX = (event.clientX - bounds.left) * light.offsetWidth / bounds.width;
  lightTargetY = (event.clientY - bounds.top) * light.offsetHeight / bounds.height;
  if (!lightActive || reducedMotion.matches) { lightX = lightTargetX; lightY = lightTargetY; }
  lightActive = true; light.style.opacity = '1';
  if (!lightFrame) lightFrame = requestAnimationFrame(paintLight);
});
function clearLight() { lightActive = false; light.style.opacity = '0'; cancelAnimationFrame(lightFrame); lightFrame = 0; }
hero.addEventListener('pointerleave', clearLight); addEventListener('blur', clearLight); finePointer.addEventListener('change', clearLight);
