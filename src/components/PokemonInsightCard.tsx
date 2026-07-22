import { Activity, Ruler, Sparkles, Trophy, Weight } from 'lucide-react';
import type { PokemonInsightResult } from '../../api/tools/get-pokemon-insight';

const STAT_LABELS: Record<string, string> = {
  hp: 'HP',
  attack: 'Attack',
  defense: 'Defense',
  'special-attack': 'Sp. Atk',
  'special-defense': 'Sp. Def',
  speed: 'Speed',
};

type PokemonInsightCardProps = {
  result: PokemonInsightResult;
};

export function PokemonInsightCard({ result }: PokemonInsightCardProps) {
  return (
    <article className="insight-card">
      <div className="insight-identity">
        <div className="insight-artwork">
          <img src={result.image} alt={`${result.name} official artwork`} />
          <span>#{String(result.id).padStart(4, '0')}</span>
        </div>

        <div>
          <span className="result-kicker">
            <Sparkles size={15} /> Research complete
          </span>
          <h3>{result.name}</h3>
          <div className="insight-types">
            {result.types.map((type) => (
              <span key={type} className={`type-badge type-${type}`}>
                {type}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="insight-metrics">
        <div>
          <Activity size={18} />
          <span>Total stats</span>
          <strong>{result.totalStats}</strong>
        </div>
        <div>
          <Trophy size={18} />
          <span>Best stat</span>
          <strong>{STAT_LABELS[result.strongestStat.name] ?? result.strongestStat.name}</strong>
          <small>{result.strongestStat.value} pts</small>
        </div>
        <div>
          <Ruler size={18} />
          <span>Height</span>
          <strong>{result.heightMeters} m</strong>
        </div>
        <div>
          <Weight size={18} />
          <span>Weight</span>
          <strong>{result.weightKg} kg</strong>
        </div>
      </div>

      <div className="insight-stats" aria-label="Base stats chart">
        {result.stats.map((stat) => (
          <div className="insight-stat" key={stat.name}>
            <span>{STAT_LABELS[stat.name] ?? stat.name}</span>
            <div className="insight-stat-track">
              <div style={{ width: `${Math.min((stat.value / 180) * 100, 100)}%` }} />
            </div>
            <strong>{stat.value}</strong>
          </div>
        ))}
      </div>
    </article>
  );
}

