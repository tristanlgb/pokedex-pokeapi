import type { SabotageMode } from '../hooks/usePokemonResearch';
const CASES: { mode: SabotageMode; label: string }[] = [
  { mode: 'slow', label: 'Respuesta lenta' },
  { mode: 'rate-limit', label: 'Límite de solicitudes' },
  { mode: 'mid-stream', label: 'Interrumpir conexión' },
  { mode: 'network', label: 'Sin conexión' },
  { mode: 'malformed', label: 'Respuesta inválida' },
];
export function ResearchDemoControls({
  busy,
  onRun,
}: {
  busy: boolean;
  onRun: (mode: SabotageMode) => void;
}) {
  return (
    <details className="demo-controls">
      <summary>Pruebas de recuperación</summary>
      <p>Estos controles simulan errores para demostrar cómo se recupera la interfaz.</p>
      <div className="failure-lab">
        {CASES.map(({ mode, label }) => (
          <button key={mode} disabled={busy} onClick={() => onRun(mode)}>
            {label}
          </button>
        ))}
      </div>
    </details>
  );
}
