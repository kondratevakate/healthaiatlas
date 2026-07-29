import { useEffect, useRef } from 'react';

/**
 * useScrollReveal — soft, reliable scroll-triggered reveal.
 *
 * Attach the returned ref to a container. Every descendant carrying the
 * `data-reveal` attribute fades + rises into place the first time it enters
 * the viewport. A single shared IntersectionObserver watches them all.
 *
 * Why a hook (not per-component state):
 *  - One observer for the whole subtree — cheaper than N observers.
 *  - Elements already on-screen at mount are revealed immediately, so nothing
 *    is left stuck invisible (no "blocks that never appear").
 *  - Respects prefers-reduced-motion: those users get content with no motion.
 *
 * The visual transition lives in index.css (`[data-reveal]`), so the same
 * timing/easing is shared across every page that uses this hook.
 */
export function useScrollReveal<T extends HTMLElement = HTMLDivElement>(options?: {
  /** Stagger between siblings in ms. 0 = all reveal together. */
  stagger?: number;
  /** Fraction of the element visible before it reveals. */
  threshold?: number;
}) {
  const containerRef = useRef<T>(null);
  const stagger = options?.stagger ?? 60;
  const threshold = options?.threshold ?? 0.05;

  useEffect(() => {
    const root = containerRef.current;
    if (!root) return;

    const prefersReduced =
      typeof window !== 'undefined' &&
      window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

    const targets = Array.from(root.querySelectorAll<HTMLElement>('[data-reveal]'));
    if (targets.length === 0) return;

    // Reduced motion: reveal everything instantly, no observer.
    if (prefersReduced) {
      targets.forEach((el) => el.setAttribute('data-reveal', 'shown'));
      return;
    }

    const reveal = (el: HTMLElement, index: number) => {
      const delay = stagger * (index % 8); // cap cascade so late items aren't slow
      el.style.transitionDelay = `${delay}ms`;
      el.setAttribute('data-reveal', 'shown');
    };

    const observer = new IntersectionObserver(
      (entries, obs) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            const el = entry.target as HTMLElement;
            reveal(el, targets.indexOf(el));
            obs.unobserve(el); // reveal once, then stop watching
          }
        }
      },
      { threshold, rootMargin: '0px 0px -8% 0px' },
    );

    targets.forEach((el) => {
      // Elements already in view at mount: reveal immediately so nothing is
      // left hidden if IntersectionObserver doesn't fire for on-screen nodes.
      const rect = el.getBoundingClientRect();
      const inView = rect.top < window.innerHeight && rect.bottom > 0;
      if (inView) reveal(el, targets.indexOf(el));
      else observer.observe(el);
    });

    return () => observer.disconnect();
  }, [stagger, threshold]);

  return containerRef;
}
