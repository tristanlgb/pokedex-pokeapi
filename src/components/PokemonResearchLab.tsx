import { Search, Square } from 'lucide-react';
import { usePokemonResearch } from '../hooks/usePokemonResearch';
import { ChatFailureCard } from './ChatFailureCard';
import { MotionActionButton } from './MotionActionButton';
import { ToolPartRenderer } from './ToolPartRenderer';
import { ResearchDemoControls } from './ResearchDemoControls';
import '../styles/research.css';
export function PokemonResearchLab() {
  const research = usePokemonResearch();
  const { input, setInput, isWorking, runResearch } = research;
  return (
    <section className="research-lab" id="research-lab">
      <div className="lab-heading">
        <div>
          <span className="lab-kicker">Investigación Pokémon</span>
          <h2>Descubre su perfil de combate</h2>
          <p>
            Consulta un Pokémon y recibe sus datos desde PokéAPI. Esta demostración utiliza una
            herramienta determinista: no interviene un modelo de inteligencia artificial.
          </p>
        </div>
      </div>
      <form
        className="research-form"
        onSubmit={(event) => {
          event.preventDefault();
          runResearch(input);
        }}
      >
        <Search size={20} />
        <input
          aria-label="Pokémon para investigar"
          value={input}
          maxLength={40}
          onChange={(event) => setInput(event.target.value)}
          placeholder="Pikachu, Gengar o #149"
        />
        {isWorking ? (
          <button
            className="stop-research-button"
            type="button"
            onClick={() => research.stop()}
            aria-label="Detener investigación"
            autoFocus
          >
            <Square size={16} />
            Detener
          </button>
        ) : (
          <MotionActionButton state={research.actionState} disabled={!input.trim()} />
        )}
      </form>
      {!input.trim() && (
        <p className="field-hint" role="status">
          Ingresa un nombre o número de Pokémon para continuar.
        </p>
      )}
      <div className="example-row">
        <span>Prueba con</span>
        {['gengar', 'charizard'].map((name) => (
          <button
            key={name}
            disabled={isWorking}
            onClick={() => {
              setInput(name);
              runResearch(name);
            }}
          >
            {name}
          </button>
        ))}
      </div>
      {research.stopped && (
        <p role="status">Investigación detenida. Puedes iniciar otra consulta.</p>
      )}
      <div className="tool-stage" aria-live="polite" aria-atomic="false">
        {research.error ? (
          <ChatFailureCard
            kind={research.failureKind}
            pokemonName={research.lastPokemon}
            busy={isWorking}
            onRetry={research.retry}
          />
        ) : (
          <ToolPartRenderer
            part={
              isWorking && !research.latestToolPart
                ? {
                    type: 'tool-getPokemonInsight',
                    toolCallId: 'pending',
                    state: 'input-streaming',
                  }
                : research.latestToolPart
            }
            onRecover={() => {
              setInput('pikachu');
              runResearch('pikachu');
            }}
            onResearchPikachu={() => {
              setInput('pikachu');
              runResearch('pikachu');
            }}
            onPrefillGengar={() => setInput('gengar')}
          />
        )}
      </div>
      <ResearchDemoControls
        busy={isWorking}
        onRun={(mode) => runResearch(input || 'pikachu', mode)}
      />
    </section>
  );
}
