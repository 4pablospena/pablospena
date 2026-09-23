// The portrait stays fixed. Only the masthead clock and a one-time entrance move.
(() => {
  const root = document.documentElement;
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');

  // Local time in Asturias, ticking in the masthead.
  const clock = document.querySelector('[data-clock]');
  if (clock) {
    const format = new Intl.DateTimeFormat('es-ES', { hour: '2-digit', minute: '2-digit', second: '2-digit', timeZone: 'Europe/Madrid', hour12: false });
    const tick = () => { clock.textContent = format.format(new Date()); };
    tick(); setInterval(tick, 1000);
  }

  window.PSPReveal = function reveal(element) {
    if (!element || reducedMotion.matches) return;
    element.animate([
      { opacity: 0, transform: 'translateY(14px)', filter: 'blur(8px)' },
      { opacity: 1, transform: 'none', filter: 'blur(0)' }
    ], { duration: 900, easing: 'cubic-bezier(.2,.8,.2,1)' });
  };
  root.classList.toggle('fx-intro', !reducedMotion.matches);

  // Custom cursor: a dot that tracks the mouse and a ring that trails it.
  const finePointer = matchMedia('(hover: hover) and (pointer: fine)');
  const dot = document.createElement('div');
  const ring = document.createElement('div');
  dot.className = 'cursor-dot'; ring.className = 'cursor-ring';
  dot.setAttribute('aria-hidden', 'true'); ring.setAttribute('aria-hidden', 'true');
  document.body.append(ring, dot);

  const pos = { x: -100, y: -100, rx: -100, ry: -100 };
  let frame = 0;
  const enabled = () => finePointer.matches && !reducedMotion.matches;
  const sync = () => root.classList.toggle('has-cursor', enabled());
  sync();
  finePointer.addEventListener('change', sync);
  reducedMotion.addEventListener('change', sync);

  function follow() {
    pos.rx += (pos.x - pos.rx) * .18;
    pos.ry += (pos.y - pos.ry) * .18;
    ring.style.transform = `translate3d(${pos.rx}px, ${pos.ry}px, 0)`;
    frame = Math.hypot(pos.x - pos.rx, pos.y - pos.ry) > .1 ? requestAnimationFrame(follow) : 0;
  }
  addEventListener('pointermove', event => {
    if (!enabled() || event.pointerType !== 'mouse') return;
    pos.x = event.clientX; pos.y = event.clientY;
    dot.style.transform = `translate3d(${pos.x}px, ${pos.y}px, 0)`;
    root.classList.add('cursor-visible');
    const target = event.target.closest?.('a, button, [role="tab"], summary, label');
    root.classList.toggle('cursor-hover', Boolean(target));
    if (!frame) frame = requestAnimationFrame(follow);
  }, { passive: true });
  document.addEventListener('pointerleave', () => root.classList.remove('cursor-visible'));
  addEventListener('blur', () => root.classList.remove('cursor-visible'));
  addEventListener('pointerdown', () => root.classList.add('cursor-press'));
  addEventListener('pointerup', () => root.classList.remove('cursor-press'));
})();
