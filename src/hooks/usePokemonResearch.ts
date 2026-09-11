import { useChat } from '@ai-sdk/react';
import { DefaultChatTransport } from 'ai';
import { useMemo, useState } from 'react';
import type { FailureKind } from '../components/ChatFailureCard';
import type { InsightToolPart } from '../components/ToolPartRenderer';
import type { MotionActionState } from '../components/MotionActionButton';
export type SabotageMode = 'none' | 'network' | 'rate-limit' | 'mid-stream' | 'slow' | 'malformed';
async function demoFetch(input: RequestInfo | URL, init?: RequestInit) {
  if (
    typeof init?.body === 'string' &&
    (JSON.parse(init.body) as { sabotage?: string }).sabotage === 'network'
  )
    throw new TypeError('Fallo de red simulado.');
  return fetch(input, init);
}
const transport = new DefaultChatTransport({ api: '/api/chat', fetch: demoFetch });
export function usePokemonResearch() {
  const [stopped, setStopped] = useState(false);
  const [input, setInput] = useState('pikachu');
  const [lastPokemon, setLastPokemon] = useState('pikachu');
  const [failureKind, setFailureKind] = useState<FailureKind>('unknown');
  const { messages, sendMessage, regenerate, status, error, clearError, stop } = useChat({
    transport,
  });
  const latestToolPart = useMemo(() => {
    const latest = messages[messages.length - 1];
    if (stopped || latest?.role !== 'assistant') return undefined;
    return [...(latest?.parts ?? [])]
      .reverse()
      .find((part) => part.type === 'tool-getPokemonInsight') as InsightToolPart | undefined;
  }, [messages, stopped]);
  const isWorking = status === 'submitted' || status === 'streaming';
  const actionState: MotionActionState = isWorking
    ? 'loading'
    : error || latestToolPart?.state === 'output-error'
      ? 'error'
      : latestToolPart?.state === 'output-available'
        ? 'success'
        : 'idle';
  function runResearch(name: string, sabotage: SabotageMode = 'none') {
    const trimmed = name.trim();
    if (!trimmed || isWorking) return;
    setStopped(false);
    setLastPokemon(trimmed);
    setFailureKind(
      sabotage === 'network' || sabotage === 'rate-limit' || sabotage === 'mid-stream'
        ? sabotage
        : 'unknown',
    );
    clearError();
    void sendMessage(
      { text: 'Research ' + trimmed + ' and build its battle profile.' },
      { body: { sabotage } },
    );
  }
  function retry() {
    if (!isWorking) {
      setStopped(false);
      clearError();
      setFailureKind('unknown');
      void regenerate({ body: { sabotage: 'none' } });
    }
  }
  return {
    input,
    setInput,
    lastPokemon,
    failureKind,
    latestToolPart,
    isWorking,
    actionState,
    error,
    stopped,
    stop: () => {
      setStopped(true);
      void stop();
    },
    retry,
    runResearch,
  };
}
