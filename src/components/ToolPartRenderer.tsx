import { AlertTriangle, Bot } from 'lucide-react';
import type { PokemonInsightResult } from '../../api/tools/get-pokemon-insight';
import { PokemonInsightCard } from './PokemonInsightCard';
import { PokemonInsightSkeleton } from './PokemonInsightSkeleton';

export type InsightToolPart = {
  type: 'tool-getPokemonInsight';
  toolCallId: string;
  state: 'input-streaming' | 'input-available' | 'output-available' | 'output-error';
  input?: { name?: string };
  output?: PokemonInsightResult;
  errorText?: string;
};

type ToolPartRendererProps = {
  part?: InsightToolPart;
  onRecover: () => void;
  onResearchPikachu: () => void;
  onPrefillGengar: () => void;
};

export function ToolPartRenderer({ part, onRecover, onResearchPikachu, onPrefillGengar }: ToolPartRendererProps) {
  if (!part) {
    return (
      <div className="tool-empty">
        <div><Bot size={28} /></div>
        <h3>Ready for a tool call</h3>
        <p>Choose a Pokémon above to watch structured AI move through every lifecycle state.</p>
        <div className="empty-actions">
          <button onClick={onResearchPikachu}>Research Pikachu</button>
          <button onClick={onPrefillGengar}>Prefill Gengar</button>
        </div>
      </div>
    );
  }

  if (part.state === 'input-streaming') {
    return (
      <div className="tool-input-streaming" role="status">
        <div className="stream-orbit"><span /><span /><span /></div>
        <div><span>Interpreting request</span><h3>The model is streaming tool input…</h3></div>
      </div>
    );
  }

  if (part.state === 'input-available') return <PokemonInsightSkeleton name={part.input?.name} />;
  if (part.state === 'output-available' && part.output) return <PokemonInsightCard result={part.output} />;

  return (
    <div className="tool-output-error" role="alert">
      <div><AlertTriangle size={28} /></div>
      <span>Tool execution failed safely</span>
      <h3>We couldn’t build that profile</h3>
      <p>{part.errorText ?? 'PokéAPI returned an unexpected response.'}</p>
      <button onClick={onRecover}>Recover with Pikachu</button>
    </div>
  );
}
