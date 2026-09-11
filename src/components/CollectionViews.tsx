import { useEffect, useState } from 'react';
import { getPokemonType } from '../api/pokeApi';
import { usePokemonSelection } from '../hooks/usePokemonSelection';
import { artwork, formatId, STAT_LABELS, TYPE_LABELS, statTotal } from '../lib/pokemon';
import type { PokemonDetails, PokemonTypeResponse } from '../types';

export function defensiveMultiplier(types: PokemonTypeResponse[], attack: string) {
  return types.reduce((value, type) => {
    const relation = type.damage_relations;
    if (relation.no_damage_from.some((item) => item.name === attack)) return 0;
    if (relation.double_damage_from.some((item) => item.name === attack)) return value * 2;
    if (relation.half_damage_from.some((item) => item.name === attack)) return value / 2;
    return value;
  }, 1);
}
function TeamCoverage({ pokemon }: { pokemon: PokemonDetails[] }) {
  const typeKey = [...new Set(pokemon.flatMap((item) => item.types.map(({ type }) => type.name)))]
    .sort()
    .join(',');
  const [relations, setRelations] = useState<Record<string, PokemonTypeResponse>>({});
  const [error, setError] = useState('');
  const [revision, setRevision] = useState(0);
  useEffect(() => {
    const controller = new AbortController();
    setError('');
    setRelations({});
    const names = typeKey ? typeKey.split(',') : [];
    Promise.all(
      names.map(async (name) => [name, await getPokemonType(name, controller.signal)] as const),
    )
      .then((entries) => {
        if (!controller.signal.aborted) setRelations(Object.fromEntries(entries));
      })
      .catch(() => {
        if (!controller.signal.aborted) setError('No se pudieron calcular las debilidades.');
      });
    return () => controller.abort();
  }, [typeKey, revision]);
  if (error)
    return (
      <div role="alert">
        {error}{' '}
        <button onClick={() => setRevision((value) => value + 1)}>Reintentar análisis</button>
      </div>
    );
  if (!Object.keys(relations).length) return <p role="status">Analizando tipos del equipo…</p>;
  return (
    <section className="coverage-panel">
      <h3>Balance defensivo</h3>
      <p>
        Cuántos integrantes son débiles o resistentes a cada tipo. Se consideran los tipos actuales,
        sin habilidades, objetos ni efectos de combate.
      </p>
      <div className="coverage-grid">
        {Object.entries(TYPE_LABELS).map(([attack, label]) => {
          const values = pokemon.map((item) =>
            defensiveMultiplier(
              item.types.map(({ type }) => relations[type.name]),
              attack,
            ),
          );
          const weak = values.filter((value) => value > 1).length;
          const resistant = values.filter((value) => value < 1).length;
          return (
            <div key={attack} className={weak >= 2 ? 'shared-weakness' : ''}>
              <span className={'type-badge type-' + attack}>{label}</span>
              <strong>{weak} débiles</strong>
              <small>{resistant} resistentes o inmunes</small>
            </div>
          );
        })}
      </div>
    </section>
  );
}
interface CollectionProps {
  ids: number[];
  onRemove: (id: number) => void;
  onOpen: (pokemon: PokemonDetails) => void;
  onExplore: () => void;
  mode: 'compare' | 'team';
}
export function CollectionView({ ids, onRemove, onOpen, onExplore, mode }: CollectionProps) {
  const { items, loading, error, retry } = usePokemonSelection(ids);
  const limit = mode === 'compare' ? 2 : 6;
  if (ids.length === 0)
    return (
      <div className="empty-state">
        <h2>
          {mode === 'compare'
            ? 'Dos Pokémon, una mirada más clara'
            : 'Tu equipo empieza con un compañero'}
        </h2>
        <p>Elige hasta {limit} Pokémon desde las tarjetas del catálogo.</p>
        <button className="primary-button" onClick={onExplore}>
          Explorar Pokémon
        </button>
      </div>
    );
  if (loading) return <p role="status">Cargando selección…</p>;
  if (error)
    return (
      <div className="error-state" role="alert">
        <p>{error}</p>
        <button onClick={retry}>Reintentar</button>
        <button onClick={onExplore}>Volver a explorar</button>
      </div>
    );
  return (
    <>
      <div className={'selection-grid selection-' + mode}>
        {items.map((pokemon) => (
          <article className="selection-card" key={pokemon.id}>
            <button className="selection-open" onClick={() => onOpen(pokemon)}>
              <span>{formatId(pokemon.id)}</span>
              <img src={artwork(pokemon) ?? undefined} alt="" width="140" height="140" />
              <h3>{pokemon.name}</h3>
            </button>
            <div className="type-row">
              {pokemon.types.map(({ type }) => (
                <span className={'type-badge type-' + type.name} key={type.name}>
                  {TYPE_LABELS[type.name]}
                </span>
              ))}
            </div>
            <button
              className="text-button"
              aria-label={'Quitar a ' + pokemon.name}
              onClick={() => onRemove(pokemon.id)}
            >
              Quitar
            </button>
          </article>
        ))}
        {items.length < limit && (
          <button className="selection-add" onClick={onExplore}>
            + Elegir {mode === 'compare' ? 'otro Pokémon' : 'compañero'}
            <small>
              {items.length} de {limit} elegidos
            </small>
          </button>
        )}
      </div>
      {mode === 'compare' && items.length === 2 && (
        <div className="comparison-panel">
          <h3>Estadísticas frente a frente</h3>
          <p>La diferencia indica cuánto supera el segundo Pokémon al primero.</p>
          <div className="table-scroll">
            <table>
              <caption className="sr-only">
                Comparación de {items[0].name} y {items[1].name}
              </caption>
              <thead>
                <tr>
                  <th>Estadística</th>
                  {items.map((item) => (
                    <th key={item.id}>{item.name}</th>
                  ))}
                  <th>Diferencia</th>
                </tr>
              </thead>
              <tbody>
                {[...Object.keys(STAT_LABELS), 'total'].map((stat) => {
                  const values = items.map((item) =>
                    stat === 'total'
                      ? statTotal(item)
                      : (item.stats.find((entry) => entry.stat.name === stat)?.base_stat ?? 0),
                  );
                  const difference = values[1] - values[0];
                  return (
                    <tr key={stat}>
                      <th scope="row">{STAT_LABELS[stat] ?? 'Total'}</th>
                      {values.map((value, index) => (
                        <td key={index} className={value > values[1 - index] ? 'higher-stat' : ''}>
                          {value}
                          <div
                            className="comparison-bar"
                            style={{
                              width: Math.min(100, value / (stat === 'total' ? 15.3 : 2.55)) + '%',
                            }}
                          />
                        </td>
                      ))}
                      <td>
                        {difference > 0 ? '+' : ''}
                        {difference}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
      {mode === 'team' && items.length > 0 && <TeamCoverage pokemon={items} />}
    </>
  );
}
