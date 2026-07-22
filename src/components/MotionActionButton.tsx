import { CircleCheck, LoaderCircle, RotateCcw, Zap } from 'lucide-react';
import { useEffect, useState } from 'react';

export type MotionActionState = 'idle' | 'loading' | 'success' | 'error';

type MotionActionButtonProps = {
  state: MotionActionState;
  disabled?: boolean;
};

const STATE_LABELS: Record<MotionActionState, string> = {
  idle: 'Run tool',
  loading: 'Researching',
  success: 'Profile ready',
  error: 'Try again',
};

export function MotionActionButton({
  state,
  disabled = false,
}: MotionActionButtonProps) {
  const [visibleState, setVisibleState] = useState<MotionActionState>(state);

  useEffect(() => {
    setVisibleState(state);

    if (state !== 'success' && state !== 'error') return;

    const resetTimer = window.setTimeout(() => setVisibleState('idle'), 1_650);
    return () => window.clearTimeout(resetTimer);
  }, [state]);

  const locked = disabled || visibleState !== 'idle';

  return (
    <button
      className="motion-action-button"
      data-state={visibleState}
      type="submit"
      disabled={locked}
      aria-label={STATE_LABELS[visibleState]}
      aria-busy={visibleState === 'loading'}
    >
      <span className="motion-button-bg motion-button-bg-success" aria-hidden="true" />
      <span className="motion-button-bg motion-button-bg-error" aria-hidden="true" />

      <span className="motion-button-content motion-button-idle" aria-hidden="true">
        <Zap size={18} /> Run tool
      </span>
      <span className="motion-button-content motion-button-loading" aria-hidden="true">
        <LoaderCircle className="motion-spinner" size={18} /> Researching
      </span>
      <span className="motion-button-content motion-button-success" aria-hidden="true">
        <CircleCheck size={19} /> Profile ready
      </span>
      <span className="motion-button-content motion-button-error" aria-hidden="true">
        <RotateCcw size={18} /> Try again
      </span>

      <span className="sr-only" aria-live="polite">{STATE_LABELS[visibleState]}</span>
    </button>
  );
}

