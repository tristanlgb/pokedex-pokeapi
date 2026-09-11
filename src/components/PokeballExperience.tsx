import { Box, Gauge, MousePointer2, Palette, Sparkles } from 'lucide-react';
import { lazy, Suspense, useEffect, useRef, useState } from 'react';

const LazyPokeballScene = lazy(() =>
  import('./PokeballScene').then((module) => ({ default: module.PokeballScene })),
);

const FINISHES = [
  { name: 'Rojo clásico', color: '#ef3340' },
  { name: 'Violeta maestro', color: '#7c3aed' },
  { name: 'Azul océano', color: '#2563eb' },
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
        <span className="experience-kicker">
          <Box size={16} /> Exploración 3D
        </span>
        <h2 id="pokeball-title">Una Poké Ball, desde todos los ángulos</h2>
        <p>
          Arrastra para girar, acerca la vista, cambia el color y abre la Poké Ball. Descubre cada
          detalle a tu ritmo.
        </p>
        <div className="experience-metrics" aria-label="Características del visor">
          <span>
            <Gauge size={16} /> Vista adaptable
          </span>
          <span>
            <MousePointer2 size={16} /> Control táctil
          </span>
          <span>
            <Sparkles size={16} /> Carga a demanda
          </span>
        </div>
      </div>

      <div className="experience-stage">
        <div className="scene-frame" aria-label="Visor 3D de Poké Ball">
          {staticMode ? (
            <div
              className="pokeball-fallback"
              role="img"
              aria-label="Vista estática de Poké Ball para movimiento reducido o dispositivos de bajo consumo"
            >
              <div
                className="fallback-ball"
                style={{ '--ball-color': finish.color } as React.CSSProperties}
              >
                <span />
              </div>
              <p>Vista estática activada según tu dispositivo o preferencia de movimiento.</p>
            </div>
          ) : isNearViewport ? (
            <Suspense
              fallback={
                <div className="scene-loading" role="status">
                  Preparando la vista 3D…
                </div>
              }
            >
              <LazyPokeballScene
                accentColor={finish.color}
                isOpen={isOpen}
                autoRotate={autoRotate}
              />
            </Suspense>
          ) : (
            <div className="scene-loading" role="status">
              La escena se cargará al acercarse a esta sección.
            </div>
          )}
        </div>

        <div className="scene-controls">
          <fieldset>
            <legend>
              <Palette size={15} /> Acabado
            </legend>
            <div className="finish-options">
              {FINISHES.map((option, index) => (
                <button
                  key={option.name}
                  type="button"
                  aria-label={`Usar ${option.name}`}
                  aria-pressed={finishIndex === index}
                  onClick={() => setFinishIndex(index)}
                  style={{ '--swatch': option.color } as React.CSSProperties}
                >
                  <span />
                  {option.name}
                </button>
              ))}
            </div>
          </fieldset>
          <div className="scene-actions">
            <button
              type="button"
              className="primary-scene-action"
              onClick={() => setIsOpen((value) => !value)}
              disabled={staticMode}
            >
              {isOpen ? 'Cerrar Poké Ball' : 'Abrir Poké Ball'}
            </button>
            <button
              type="button"
              aria-pressed={autoRotate}
              onClick={() => setAutoRotate((value) => !value)}
              disabled={staticMode}
            >
              Giro automático {autoRotate ? 'activado' : 'desactivado'}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

import '../styles/pokeball.css';
