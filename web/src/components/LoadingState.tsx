export function LoadingState({ message, compact = false }: { message: string; compact?: boolean }) {
  return <div className={`loading-state${compact ? ' compact' : ''}`} role="status" aria-live="polite">
    <span className="loading-spinner" aria-hidden="true" />
    <span>{message}</span>
  </div>;
}
