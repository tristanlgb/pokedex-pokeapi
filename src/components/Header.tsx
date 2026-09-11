import { Search, X } from 'lucide-react';
import { useEffect, useState, type FormEvent } from 'react';
interface HeaderProps {
  query: string;
  onSearch: (value: string) => void;
}
export function Header({ query, onSearch }: HeaderProps) {
  const [draft, setDraft] = useState(query);
  useEffect(() => setDraft(query), [query]);
  function submit(event: FormEvent) {
    event.preventDefault();
    onSearch(draft.trim());
  }
  return (
    <header className="app-header">
      <a
        className="brand"
        href="/"
        aria-label="Pokédex, inicio"
        onClick={(event) => {
          event.preventDefault();
          setDraft('');
          onSearch('');
        }}
      >
        <div className="pokeball" aria-hidden="true">
          <span />
        </div>
        <div>
          <h1>
            Pokédex<span className="brand-dot">.</span>
          </h1>
          <p>Tu próxima aventura empieza aquí</p>
        </div>
      </a>
      <form className="search-form" onSubmit={submit} role="search">
        <Search size={20} aria-hidden="true" />
        <input
          aria-label="Buscar Pokémon"
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          placeholder="Nombre o número: Pikachu, #025…"
          maxLength={80}
        />
        {draft && (
          <button
            className="clear-search"
            type="button"
            aria-label="Limpiar búsqueda"
            onClick={() => {
              setDraft('');
              onSearch('');
            }}
          >
            <X size={18} />
          </button>
        )}
        <button type="submit">Buscar</button>
      </form>
    </header>
  );
}
