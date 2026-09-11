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

export function ToolPartRenderer({
  part,
  onRecover,
  onResearchPikachu,
  onPrefillGengar,
}: ToolPartRendererProps) {
  if (!part) {
    return (
      <div className="tool-empty">
        <div>
          <Bot size={28} />
        </div>
        <h3>Todo listo para investigar</h3>
        <p>Elige un Pokémon para conocer sus estadísticas y características.</p>
        <div className="empty-actions">
          <button onClick={onResearchPikachu}>Investigar Pikachu</button>
          <button onClick={onPrefillGengar}>Elegir Gengar</button>
        </div>
      </div>
    );
  }

  if (part.state === 'input-streaming') {
    return (
      <div className="tool-input-streaming" role="status">
        <div className="stream-orbit">
          <span />
          <span />
          <span />
        </div>
        <div>
          <span>Preparando consulta</span>
          <h3>Enviando datos de la consulta…</h3>
        </div>
      </div>
    );
  }

  if (part.state === 'input-available') return <PokemonInsightSkeleton name={part.input?.name} />;
  if (part.state === 'output-available' && part.output)
    return <PokemonInsightCard result={part.output} />;

  return (
    <div className="tool-output-error" role="alert">
      <div>
        <AlertTriangle size={28} />
      </div>
      <span>No se pudo completar la consulta</span>
      <h3>No pudimos crear el perfil</h3>
      <p>{part.errorText ?? 'PokéAPI devolvió una respuesta inesperada.'}</p>
      <button onClick={onRecover}>Probar con Pikachu</button>
    </div>
  );
}
