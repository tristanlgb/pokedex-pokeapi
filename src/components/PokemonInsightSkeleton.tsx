type PokemonInsightSkeletonProps = {
  name?: string;
};

export function PokemonInsightSkeleton({ name }: PokemonInsightSkeletonProps) {
  return (
    <article className="insight-skeleton" aria-label={`Building ${name ?? 'Pokémon'} profile`}>
      <div className="skeleton-heading">
        <div className="skeleton-art skeleton-pulse" />
        <div>
          <span>Input validated · querying PokéAPI</span>
          <div className="skeleton-line skeleton-line-title skeleton-pulse" />
          <div className="skeleton-line skeleton-line-chip skeleton-pulse" />
        </div>
      </div>
      <div className="skeleton-metrics">
        {Array.from({ length: 4 }, (_, index) => (
          <div className="skeleton-pulse" key={index} />
        ))}
      </div>
      <div className="skeleton-stats">
        {Array.from({ length: 6 }, (_, index) => (
          <div key={index}>
            <span className="skeleton-pulse" />
            <span className="skeleton-pulse" />
          </div>
        ))}
      </div>
    </article>
  );
}

