// RNW forwards unrecognized style props straight through as CSS, so the
// app's few motion effects (marquee, pulsing live dots) run on real CSS
// keyframes injected once here rather than a JS animation loop.
let injected = false;

export function ensureWebAnimations() {
  if (injected || typeof document === 'undefined') return;
  injected = true;
  const style = document.createElement('style');
  style.textContent = `
    @keyframes educast-marquee {
      from { transform: translateX(0); }
      to { transform: translateX(-50%); }
    }
    @keyframes educast-pulse {
      0%, 100% { opacity: 0.55; transform: scale(1); }
      50% { opacity: 0; transform: scale(1.9); }
    }
  `;
  document.head.appendChild(style);
}

export function prefersReducedMotion() {
  if (typeof window === 'undefined' || !window.matchMedia) return false;
  try {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  } catch (e) {
    return false;
  }
}
