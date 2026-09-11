import { GENERATIONS, TYPE_LABELS } from '../lib/pokemon';
import type { CatalogLocation, Sort } from '../hooks/useCatalogLocation';
interface FiltersProps {
  location: CatalogLocation;
  onChange: (value: Partial<CatalogLocation>) => void;
}
export function Filters({ location, onChange }: FiltersProps) {
  return (
    <section className="catalog-filters" aria-label="Filtros del catálogo">
      <div className="filter-toolbar">
        <label>
          Generación
          <select
            value={location.generation}
            onChange={(event) => onChange({ generation: event.target.value })}
          >
            <option value="all">Todas las generaciones</option>
            {GENERATIONS.map((name, index) => (
              <option key={name} value={index + 1}>
                {index + 1} · {name}
              </option>
            ))}
          </select>
        </label>
        <label>
          Ordenar por
          <select
            value={location.sort}
            onChange={(event) => onChange({ sort: event.target.value as Sort })}
          >
            <option value="number">Número de Pokédex</option>
            <option value="name">Nombre A–Z</option>
            <option value="total">Estadísticas totales ↓</option>
            <option value="speed">Velocidad ↓</option>
          </select>
        </label>
        {(location.type !== 'all' ||
          location.generation !== 'all' ||
          location.query ||
          location.sort !== 'number') && (
          <button
            className="text-button"
            onClick={() => onChange({ type: 'all', generation: 'all', sort: 'number', query: '' })}
          >
            Restablecer filtros
          </button>
        )}
      </div>
      <div className="filter-scroll" aria-label="Filtrar por tipo">
        {Object.entries({ all: 'Todos', ...TYPE_LABELS }).map(([type, label]) => (
          <button
            key={type}
            className={'type-chip ' + (location.type === type ? 'selected' : '')}
            aria-pressed={location.type === type}
            onClick={() => onChange({ type })}
          >
            {label}
          </button>
        ))}
      </div>
    </section>
  );
}
