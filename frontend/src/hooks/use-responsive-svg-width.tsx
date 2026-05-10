import { useEffect, useLayoutEffect, useRef, useState } from 'react';

export function useResponsiveSvgWidth(initial = 0) {
  const ref = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(initial);

  useLayoutEffect(() => {
    if (ref.current) setWidth(ref.current.clientWidth);
  }, []);

  useEffect(() => {
    if (!ref.current) return;
    const obs = new ResizeObserver((entries) => {
      for (const entry of entries) setWidth(entry.contentRect.width);
    });
    obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  return { ref, width };
}
