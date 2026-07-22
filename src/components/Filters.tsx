interface FiltersProps {
  selectedType: string;
  onTypeChange: (type: string) => void;
}

const TYPES = [
  'all',
  'normal',
  'fire',
  'water',
  'electric',
  'grass',
  'ice',
  'fighting',
  'poison',
  'ground',
  'flying',
  'psychic',
  'bug',
  'rock',
  'ghost',
  'dragon',
  'dark',
  'steel',
  'fairy',
];

export function Filters({ selectedType, onTypeChange }: FiltersProps) {
  return (
    <section className="filters" aria-label="Filtros por tipo">
      <span>Filtrar:</span>
      <div className="filter-scroll">
        {TYPES.map((type) => (
          <button
            key={type}
            type="button"
            className={`type-chip type-${type} ${
              selectedType === type ? 'selected' : ''
            }`}
            onClick={() => onTypeChange(type)}
          >
            {type === 'all' ? 'Todos' : type}
          </button>
        ))}
      </div>
    </section>
  );
}
