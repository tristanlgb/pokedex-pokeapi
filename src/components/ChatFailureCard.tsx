import { AlertTriangle, LoaderCircle, RotateCcw } from 'lucide-react';

export type FailureKind = 'network' | 'rate-limit' | 'mid-stream' | 'unknown';

type ChatFailureCardProps = {
  kind: FailureKind;
  pokemonName: string;
  busy: boolean;
  onRetry: () => void;
};

const FAILURE_COPY: Record<FailureKind, { eyebrow: string; title: string; detail: string }> = {
  network: {
    eyebrow: 'Sin conexión',
    title: 'La solicitud no llegó al servidor',
    detail: 'Revisa tu conexión y vuelve a intentarlo. Conservamos tu consulta.',
  },
  'rate-limit': {
    eyebrow: 'Límite de solicitudes',
    title: 'El servicio necesita un momento',
    detail: 'Puedes reintentar con el mismo Pokémon sin volver a escribir la consulta.',
  },
  'mid-stream': {
    eyebrow: 'Conexión interrumpida',
    title: 'La conexión terminó durante la investigación',
    detail: 'La respuesta parcial se descartó para evitar mostrar un perfil incompleto.',
  },
  unknown: {
    eyebrow: 'No se pudo realizar la consulta',
    title: 'No se pudo completar la investigación',
    detail: 'Puedes volver a intentar la última consulta.',
  },
};

export function ChatFailureCard({ kind, pokemonName, busy, onRetry }: ChatFailureCardProps) {
  const copy = FAILURE_COPY[kind];

  return (
    <div className="chat-failure" role="alert">
      <div className="chat-failure-icon">
        <AlertTriangle size={28} />
      </div>
      <span>{copy.eyebrow}</span>
      <h3>{copy.title}</h3>
      <p>{copy.detail}</p>
      <button onClick={onRetry} disabled={busy}>
        {busy ? <LoaderCircle className="motion-spinner" size={18} /> : <RotateCcw size={18} />}
        {busy ? 'Reintentando…' : `Reintentar ${pokemonName}`}
      </button>
    </div>
  );
}
