import { Heart, Search } from 'lucide-react';

interface HeaderProps {
  query: string;
  favoriteCount: number;
  onQueryChange: (value: string) => void;
  onSearch: () => void;
  onShowFavorites: () => void;
  showingFavorites: boolean;
}

export function Header({
  query,
  favoriteCount,
  onQueryChange,
  onSearch,
  onShowFavorites,
  showingFavorites,
}: HeaderProps) {
  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    onSearch();
  }

  return (
    <header className="app-header">
      <div className="brand">
        <div className="pokeball" aria-hidden="true">
          <span />
        </div>
        <div>
          <h1>Pokédex</h1>
          <p>React + TypeScript + PokéAPI</p>
        </div>
      </div>

      <form className="search-form" onSubmit={handleSubmit}>
        <Search size={20} />
        <input
          aria-label="Buscar Pokémon"
          value={query}
          onChange={(event) => onQueryChange(event.target.value)}
          placeholder="Buscar por nombre o número..."
        />
        <button type="submit">Buscar</button>
      </form>

      <button
        className={`favorites-button ${showingFavorites ? 'active' : ''}`}
        onClick={onShowFavorites}
        type="button"
      >
        <Heart size={20} fill={showingFavorites ? 'currentColor' : 'none'} />
        Favoritos
        <span>{favoriteCount}</span>
      </button>
    </header>
  );
}
