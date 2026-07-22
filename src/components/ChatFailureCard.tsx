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
    eyebrow: 'Network unavailable',
    title: 'The request never reached the server',
    detail: 'Check your connection, then retry this Pokémon. Your input is still here.',
  },
  'rate-limit': {
    eyebrow: 'Rate limit handled',
    title: 'The research service needs a moment',
    detail: 'Nothing was lost. Retry the same Pokémon without starting the whole flow again.',
  },
  'mid-stream': {
    eyebrow: 'Stream interrupted',
    title: 'The connection ended during research',
    detail: 'The partial response was discarded so an incomplete profile cannot reach the UI.',
  },
  unknown: {
    eyebrow: 'Request failed safely',
    title: 'The research route could not finish',
    detail: 'The interface is still working and the last request can be retried safely.',
  },
};

export function ChatFailureCard({
  kind,
  pokemonName,
  busy,
  onRetry,
}: ChatFailureCardProps) {
  const copy = FAILURE_COPY[kind];

  return (
    <div className="chat-failure" role="alert">
      <div className="chat-failure-icon"><AlertTriangle size={28} /></div>
      <span>{copy.eyebrow}</span>
      <h3>{copy.title}</h3>
      <p>{copy.detail}</p>
      <button onClick={onRetry} disabled={busy}>
        {busy ? <LoaderCircle className="motion-spinner" size={18} /> : <RotateCcw size={18} />}
        {busy ? 'Retrying…' : `Retry ${pokemonName}`}
      </button>
    </div>
  );
}

