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
