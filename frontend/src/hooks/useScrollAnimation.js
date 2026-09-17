import { useEffect, useRef } from 'react';

/**
 * Attach to a container ref — all .fade-up children inside will animate
 * when they scroll into view. Also works with a single element ref.
 */
export function useScrollAnimation(options = {}) {
  const ref = useRef(null);

  useEffect(() => {
    const root = ref.current;
    if (!root) return;

    const targets = root.classList.contains('fade-up')
      ? [root]
      : Array.from(root.querySelectorAll('.fade-up'));

    if (!targets.length) return;

    targets.forEach(el => { el.style.animationPlayState = 'paused'; });

    const obs = new IntersectionObserver(
      entries => entries.forEach(e => {
        if (e.isIntersecting) {
          e.target.style.animationPlayState = 'running';
          obs.unobserve(e.target);
        }
      }),
      { threshold: options.threshold ?? 0.12, ...options }
    );

    targets.forEach(el => obs.observe(el));
    return () => obs.disconnect();
  }, []);

  return ref;
}
