import { useEffect, useRef, useState } from 'react';

export default function NetworkAnimation() {
  const stage = useRef(null);
  const [unavailable, setUnavailable] = useState(false);

  useEffect(() => {
    const engine = window.HL;
    const definition = window.ccnaNetworkFigure;
    if (!engine || !definition?.mount) {
      setUnavailable(true);
      return;
    }
    const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const updateMotion = () => engine.setReducedMotion(motion.matches);
    let svg;
    let figure;
    try {
      updateMotion();
      engine.inject(document);
      svg = engine.mk('svg', { viewBox: '0 0 400 320', 'aria-hidden': 'true' }, stage.current);
      figure = definition.mount({ stage: stage.current, svg, read: {} }, 6);
      motion.addEventListener('change', updateMotion);
    } catch {
      svg?.remove();
      setUnavailable(true);
      return;
    }
    return () => {
      figure.destroy();
      svg.remove();
      motion.removeEventListener('change', updateMotion);
    };
  }, []);

  return <div ref={stage} className="network-animation" data-hairline="network" data-hairline-theme="dark" role="img" aria-label="Wyspa LAN: komputer, serwer, router i switch na wspólnej podstawie.">{unavailable && <img src="/hairline/network-fallback.svg" alt="" />}</div>;
}
