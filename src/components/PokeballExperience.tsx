import { Box, Gauge, MousePointer2, Palette, Sparkles } from 'lucide-react';
import { lazy, Suspense, useEffect, useRef, useState } from 'react';

const LazyPokeballScene = lazy(() =>
  import('./PokeballScene').then((module) => ({ default: module.PokeballScene })),
);

const FINISHES = [
  { name: 'Classic red', color: '#ef3340' },
  { name: 'Master violet', color: '#7c3aed' },
  { name: 'Ocean blue', color: '#2563eb' },
] as const;

function prefersStaticExperience() {
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const deviceMemory = (navigator as Navigator & { deviceMemory?: number }).deviceMemory;
  return reducedMotion || (deviceMemory !== undefined && deviceMemory <= 4);
}

export function PokeballExperience() {
  const sectionRef = useRef<HTMLElement>(null);
  const [isNearViewport, setIsNearViewport] = useState(false);
  const [staticMode, setStaticMode] = useState(true);
  const [finishIndex, setFinishIndex] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [autoRotate, setAutoRotate] = useState(true);

  useEffect(() => {
    setStaticMode(prefersStaticExperience());
    const section = sectionRef.current;
    if (!section) return;
    const observer = new IntersectionObserver(
      ([entry]) => entry.isIntersecting && setIsNearViewport(true),
      { rootMargin: '240px' },
    );
    observer.observe(section);
    return () => observer.disconnect();
  }, []);

  const finish = FINISHES[finishIndex];

  return (
    <section className="pokeball-experience" ref={sectionRef} aria-labelledby="pokeball-title">
      <div className="experience-copy">
        <span className="experience-kicker"><Box size={16} /> Interactive 3D lab</span>
        <h2 id="pokeball-title">Inspect a Poké Ball from every angle</h2>
        <p>
          Drag or swipe to rotate, pinch or scroll to zoom, switch its finish, and trigger the opening sequence.
          The scene is built from lightweight procedural geometry—no heavyweight model download required.
        </p>
        <div className="experience-metrics" aria-label="3D performance notes">
          <span><Gauge size={16} /> 1–1.5× DPR cap</span>
          <span><MousePointer2 size={16} /> Touch ready</span>
          <span><Sparkles size={16} /> Lazy loaded</span>
        </div>
      </div>

      <div className="experience-stage">
        <div className="scene-frame" aria-label="Interactive 3D Poké Ball viewer">
          {staticMode ? (
            <div className="pokeball-fallback" role="img" aria-label="Static Poké Ball preview for reduced motion or low-power devices">
              <div className="fallback-ball" style={{ '--ball-color': finish.color } as React.CSSProperties}><span /></div>
              <p>Static preview enabled to respect your device or motion preference.</p>
            </div>
          ) : isNearViewport ? (
            <Suspense fallback={<div className="scene-loading" role="status">Preparing the 3D stage…</div>}>
              <LazyPokeballScene accentColor={finish.color} isOpen={isOpen} autoRotate={autoRotate} />
            </Suspense>
          ) : (
            <div className="scene-loading" role="status">3D scene loads as it approaches the viewport.</div>
          )}
        </div>

        <div className="scene-controls">
          <fieldset>
            <legend><Palette size={15} /> Finish</legend>
            <div className="finish-options">
              {FINISHES.map((option, index) => (
                <button
                  key={option.name}
                  type="button"
                  aria-label={`Use ${option.name}`}
                  aria-pressed={finishIndex === index}
                  onClick={() => setFinishIndex(index)}
                  style={{ '--swatch': option.color } as React.CSSProperties}
                >
                  <span />{option.name}
                </button>
              ))}
            </div>
          </fieldset>
          <div className="scene-actions">
            <button type="button" className="primary-scene-action" onClick={() => setIsOpen((value) => !value)} disabled={staticMode}>
              {isOpen ? 'Close Poké Ball' : 'Open Poké Ball'}
            </button>
            <button type="button" aria-pressed={autoRotate} onClick={() => setAutoRotate((value) => !value)} disabled={staticMode}>
              Auto-rotate {autoRotate ? 'on' : 'off'}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
