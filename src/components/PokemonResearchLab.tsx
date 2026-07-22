import { useChat } from '@ai-sdk/react';
import { AlertTriangle, ArrowRight, Bot, Braces, Clock3, Gauge, Search, Scissors, WifiOff } from 'lucide-react';
import { DefaultChatTransport } from 'ai';
import { type FormEvent, useMemo, useState } from 'react';
import type { PokemonInsightResult } from '../../api/tools/get-pokemon-insight';
import { ChatFailureCard, type FailureKind } from './ChatFailureCard';
import { MotionActionButton, type MotionActionState } from './MotionActionButton';
import { PokemonInsightCard } from './PokemonInsightCard';
import { PokemonInsightSkeleton } from './PokemonInsightSkeleton';

type SabotageMode = 'none' | 'network' | 'rate-limit' | 'mid-stream' | 'slow' | 'malformed';

async function checkpointFetch(input: RequestInfo | URL, init?: RequestInit) {
  if (typeof init?.body === 'string') {
    const body = JSON.parse(init.body) as { sabotage?: SabotageMode };
    if (body.sabotage === 'network') {
      await new Promise((resolve) => setTimeout(resolve, 350));
      throw new TypeError('Network request blocked by the Checkpoint 1 sabotage control.');
    }
  }

  return fetch(input, init);
}

type InsightToolPart = {
  type: 'tool-getPokemonInsight';
  toolCallId: string;
  state: 'input-streaming' | 'input-available' | 'output-available' | 'output-error';
  input?: { name?: string };
  output?: PokemonInsightResult;
  errorText?: string;
};

function isInsightToolPart(part: { type: string }): part is InsightToolPart {
  return part.type === 'tool-getPokemonInsight';
}

export function PokemonResearchLab() {
  const [input, setInput] = useState('pikachu');
  const [lastPokemon, setLastPokemon] = useState('pikachu');
  const [failureKind, setFailureKind] = useState<FailureKind>('unknown');
  const { messages, sendMessage, regenerate, status, error, clearError } = useChat({
    transport: new DefaultChatTransport({ api: '/api/chat', fetch: checkpointFetch }),
  });

  const latestToolPart = useMemo(() => {
    for (const message of [...messages].reverse()) {
      for (const part of [...message.parts].reverse()) {
        if (isInsightToolPart(part)) return part;
      }
    }
    return undefined;
  }, [messages]);

  const isWorking = status === 'submitted' || status === 'streaming';
  const actionState: MotionActionState = isWorking
    ? 'loading'
    : latestToolPart?.state === 'output-available'
      ? 'success'
      : latestToolPart?.state === 'output-error' || error
        ? 'error'
        : 'idle';

  function runResearch(name: string, sabotage: SabotageMode = 'none') {
    const trimmedName = name.trim();
    if (!trimmedName || isWorking) return;
    setLastPokemon(trimmedName);
    setFailureKind(
      sabotage === 'network' || sabotage === 'rate-limit' || sabotage === 'mid-stream'
        ? sabotage
        : 'unknown',
    );
    clearError();
    void sendMessage(
      { text: `Research ${trimmedName} and build its battle profile.` },
      { body: { sabotage } },
    );
  }

  function handleRetry() {
    if (isWorking) return;
    clearError();
    setFailureKind('unknown');
    void regenerate({ body: { sabotage: 'none' } });
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    runResearch(input);
  }

  return (
    <section className="research-lab" id="research-lab">
      <div className="lab-heading">
        <div>
          <span className="lab-kicker"><Bot size={16} /> Generative UI lab</span>
          <h2>Ask the Pokédex agent to research a Pokémon</h2>
          <p>
            The model chooses a typed server tool. Its input streams live, PokéAPI runs on the server,
            and the structured result becomes an interactive battle profile.
          </p>
        </div>
        <div className="contract-pill"><Braces size={18} /> Zod validated</div>
      </div>

      <form className="research-form" onSubmit={handleSubmit}>
        <Search size={20} />
        <input
          aria-label="Pokémon to research"
          value={input}
          onChange={(event) => setInput(event.target.value)}
          placeholder="Try Pikachu, Gengar, or #149"
        />
        <MotionActionButton state={actionState} disabled={!input.trim()} />
      </form>

      {!input.trim() && (
        <p className="field-hint" role="status">Enter a Pokémon name or number to enable research.</p>
      )}

      <div className="example-row">
        <span>Quick tests</span>
        {['gengar', 'charizard'].map((name) => (
          <button key={name} onClick={() => { setInput(name); runResearch(name); }} disabled={isWorking}>
            {name}
          </button>
        ))}
        <button className="failure-test" onClick={() => { setInput('missingno'); runResearch('missingno'); }} disabled={isWorking}>
          Test designed failure
        </button>
      </div>

      <div className="failure-lab" aria-label="Checkpoint failure controls">
        <div>
          <span>Checkpoint 1</span>
          <strong>Sabotage controls</strong>
        </div>
        <button onClick={() => runResearch(input || 'pikachu', 'slow')} disabled={isWorking}>
          <Clock3 size={15} /> Slow response
        </button>
        <button onClick={() => runResearch(input || 'pikachu', 'rate-limit')} disabled={isWorking}>
          <Gauge size={15} /> Force 429
        </button>
        <button onClick={() => runResearch(input || 'pikachu', 'mid-stream')} disabled={isWorking}>
          <Scissors size={15} /> Cut mid-stream
        </button>
        <button onClick={() => runResearch(input || 'pikachu', 'network')} disabled={isWorking}>
          <WifiOff size={15} /> Network offline
        </button>
      </div>

      <p className="motion-note">
        <strong>Motion recipe:</strong> 220ms state crossfades use an ease-out curve for quick acknowledgement;
        hover/press feedback uses 160ms so it feels immediate. Only transform and opacity move. Success and
        error remain readable for 1.65s before returning to idle.
      </p>

      <div className="state-rail" aria-label="Tool lifecycle">
        <div className={latestToolPart ? 'complete' : 'active'}><span>1</span> Request</div>
        <ArrowRight size={15} />
        <div className={latestToolPart?.state === 'input-streaming' ? 'active' : latestToolPart ? 'complete' : ''}><span>2</span> Input</div>
        <ArrowRight size={15} />
        <div className={latestToolPart?.state === 'input-available' ? 'active' : latestToolPart?.state?.startsWith('output') ? 'complete' : ''}><span>3</span> Execute</div>
        <ArrowRight size={15} />
        <div className={latestToolPart?.state?.startsWith('output') ? 'active' : ''}><span>4</span> Result</div>
      </div>

      <div className="tool-stage" aria-live="polite">
        {error && (
          <ChatFailureCard
            kind={failureKind}
            pokemonName={lastPokemon}
            busy={isWorking}
            onRetry={handleRetry}
          />
        )}

        {!latestToolPart && !error && (
          <div className="tool-empty">
            <div><Bot size={28} /></div>
            <h3>Ready for a tool call</h3>
            <p>Choose a Pokémon above to watch structured AI move through every lifecycle state.</p>
            <div className="empty-actions">
              <button onClick={() => { setInput('pikachu'); runResearch('pikachu'); }}>Research Pikachu</button>
              <button onClick={() => setInput('gengar')}>Prefill Gengar</button>
            </div>
          </div>
        )}

        {!error && latestToolPart?.state === 'input-streaming' && (
          <div className="tool-input-streaming">
            <div className="stream-orbit"><span /><span /><span /></div>
            <div><span>Interpreting request</span><h3>The model is streaming tool input…</h3></div>
          </div>
        )}

        {!error && latestToolPart?.state === 'input-available' && (
          <PokemonInsightSkeleton name={latestToolPart.input?.name} />
        )}

        {!error && latestToolPart?.state === 'output-available' && latestToolPart.output && (
          <PokemonInsightCard result={latestToolPart.output} />
        )}

        {!error && latestToolPart?.state === 'output-error' && (
          <div className="tool-output-error">
            <div><AlertTriangle size={28} /></div>
            <span>Tool execution failed safely</span>
            <h3>We couldn’t build that profile</h3>
            <p>{latestToolPart.errorText ?? 'PokéAPI returned an unexpected response.'}</p>
            <button onClick={() => { setInput('pikachu'); runResearch('pikachu'); }}>Recover with Pikachu</button>
          </div>
        )}

      </div>
    </section>
  );
}
