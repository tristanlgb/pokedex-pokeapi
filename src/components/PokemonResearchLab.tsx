import { useChat } from '@ai-sdk/react';
import { AlertTriangle, ArrowRight, Bot, Braces, Check, LoaderCircle, Search } from 'lucide-react';
import { DefaultChatTransport } from 'ai';
import { type FormEvent, useMemo, useState } from 'react';
import type { PokemonInsightResult } from '../../api/tools/get-pokemon-insight';
import { MotionActionButton, type MotionActionState } from './MotionActionButton';
import { PokemonInsightCard } from './PokemonInsightCard';

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
  const { messages, sendMessage, status, error, clearError } = useChat({
    transport: new DefaultChatTransport({ api: '/api/chat' }),
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

  function runResearch(name: string) {
    const trimmedName = name.trim();
    if (!trimmedName || isWorking) return;
    clearError();
    void sendMessage({ text: `Research ${trimmedName} and build its battle profile.` });
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
        {!latestToolPart && !error && (
          <div className="tool-empty">
            <div><Bot size={28} /></div>
            <h3>Ready for a tool call</h3>
            <p>Choose a Pokémon above to watch structured AI move through every lifecycle state.</p>
          </div>
        )}

        {latestToolPart?.state === 'input-streaming' && (
          <div className="tool-input-streaming">
            <div className="stream-orbit"><span /><span /><span /></div>
            <div><span>Interpreting request</span><h3>The model is streaming tool input…</h3></div>
          </div>
        )}

        {latestToolPart?.state === 'input-available' && (
          <div className="tool-input-ready">
            <div className="ready-icon"><Check size={22} /></div>
            <div>
              <span>Input validated against Zod</span>
              <h3>Calling PokéAPI for “{latestToolPart.input?.name}”</h3>
              <p>The server has accepted the arguments and is assembling a structured profile.</p>
            </div>
            <LoaderCircle className="spin-icon" size={24} />
          </div>
        )}

        {latestToolPart?.state === 'output-available' && latestToolPart.output && (
          <PokemonInsightCard result={latestToolPart.output} />
        )}

        {latestToolPart?.state === 'output-error' && (
          <div className="tool-output-error">
            <div><AlertTriangle size={28} /></div>
            <span>Tool execution failed safely</span>
            <h3>We couldn’t build that profile</h3>
            <p>{latestToolPart.errorText ?? 'PokéAPI returned an unexpected response.'}</p>
            <button onClick={() => { setInput('pikachu'); runResearch('pikachu'); }}>Recover with Pikachu</button>
          </div>
        )}

        {error && !latestToolPart && (
          <div className="tool-output-error">
            <div><AlertTriangle size={28} /></div>
            <span>Connection error</span>
            <h3>The AI route could not respond</h3>
            <p>{error.message}</p>
          </div>
        )}
      </div>
    </section>
  );
}
