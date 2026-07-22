import { useEffect, useMemo, useState } from 'react';
import { Filters } from './components/Filters';
import { Header } from './components/Header';
import { Pagination } from './components/Pagination';
import { PokemonGrid } from './components/PokemonGrid';
import { PokemonModal } from './components/PokemonModal';
import { PokemonResearchLab } from './components/PokemonResearchLab';
import { PokeballExperience } from './components/PokeballExperience';
import { getPokemonByType, getPokemonDetails, getPokemonList } from './api/pokeApi';
import { useFavorites } from './hooks/useFavorites';
import type { PokemonDetails } from './types';

const PAGE_SIZE = 20;

function App() {
  const [pokemon, setPokemon] = useState<PokemonDetails[]>([]);
  const [page, setPage] = useState(1);
  const [totalPokemon, setTotalPokemon] = useState(0);
  const [selectedType, setSelectedType] = useState('all');
  const [query, setQuery] = useState('');
  const [selectedPokemon, setSelectedPokemon] =
    useState<PokemonDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showFavorites, setShowFavorites] = useState(false);

  const { favorites, toggleFavorite, isFavorite } = useFavorites();

  const totalPages = Math.max(1, Math.ceil(totalPokemon / PAGE_SIZE));

  useEffect(() => {
    if (showFavorites) return;

    const controller = new AbortController();

    async function loadPokemon() {
      try {
        setLoading(true);
        setError('');

        if (selectedType !== 'all') {
          const byType = await getPokemonByType(selectedType);
          setPokemon(byType);
          setTotalPokemon(byType.length);
          return;
        }

        const response = await getPokemonList(
          PAGE_SIZE,
          (page - 1) * PAGE_SIZE,
        );

        const details = await Promise.all(
          response.results.map((item) => getPokemonDetails(item.name)),
        );

        if (!controller.signal.aborted) {
          setPokemon(details);
          setTotalPokemon(response.count);
        }
      } catch (loadError) {
        if (!controller.signal.aborted) {
          setError(
            loadError instanceof Error
              ? loadError.message
              : 'Ocurrió un error inesperado.',
          );
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    void loadPokemon();

    return () => controller.abort();
  }, [page, selectedType, showFavorites]);

  const visiblePokemon = useMemo(() => {
    if (!showFavorites) return pokemon;
    return pokemon.filter((item) => favorites.includes(item.id));
  }, [pokemon, favorites, showFavorites]);

  async function handleSearch() {
    const normalized = query.trim().toLowerCase();

    if (!normalized) {
      setPage(1);
      setSelectedType('all');
      setShowFavorites(false);
      return;
    }

    try {
      setLoading(true);
      setError('');
      setShowFavorites(false);
      const result = await getPokemonDetails(normalized);
      setPokemon([result]);
      setTotalPokemon(1);
      setPage(1);
      setSelectedType('all');
    } catch (searchError) {
      setPokemon([]);
      setTotalPokemon(0);
      setError(
        searchError instanceof Error
          ? searchError.message
          : 'No se pudo realizar la búsqueda.',
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleShowFavorites() {
    if (showFavorites) {
      setShowFavorites(false);
      setPage(1);
      return;
    }

    try {
      setLoading(true);
      setError('');

      const favoriteDetails = await Promise.all(
        favorites.map((id) => getPokemonDetails(id)),
      );

      setPokemon(favoriteDetails);
      setShowFavorites(true);
      setSelectedType('all');
      setTotalPokemon(favoriteDetails.length);
    } catch {
      setError('No se pudieron cargar los favoritos.');
    } finally {
      setLoading(false);
    }
  }

  function handleTypeChange(type: string) {
    setSelectedType(type);
    setShowFavorites(false);
    setPage(1);
    setQuery('');
  }

  return (
    <div className="app-shell">
      <Header
        query={query}
        favoriteCount={favorites.length}
        onQueryChange={setQuery}
        onSearch={handleSearch}
        onShowFavorites={handleShowFavorites}
        showingFavorites={showFavorites}
      />

      <main>
        <section className="intro">
          <div>
            <span className="eyebrow">Explora el mundo Pokémon</span>
            <h2>Encuentra, compara y guarda tus Pokémon favoritos</h2>
            <p>
              Consulta información real desde PokéAPI, filtra por tipo y revisa
              estadísticas detalladas.
            </p>
          </div>

          <div className="counter-card">
            <strong>{showFavorites ? favorites.length : totalPokemon}</strong>
            <span>{showFavorites ? 'favoritos' : 'Pokémon disponibles'}</span>
          </div>
        </section>

        <PokemonResearchLab />

        <PokeballExperience />

        {!showFavorites && (
          <Filters
            selectedType={selectedType}
            onTypeChange={handleTypeChange}
          />
        )}

        {loading && (
          <div className="loading-state">
            <div className="loader" />
            <p>Cargando Pokémon...</p>
          </div>
        )}

        {!loading && error && (
          <div className="error-state">
            <h2>Algo salió mal</h2>
            <p>{error}</p>
          </div>
        )}

        {!loading && !error && (
          <>
            <PokemonGrid
              pokemon={visiblePokemon}
              isFavorite={isFavorite}
              onToggleFavorite={toggleFavorite}
              onOpen={setSelectedPokemon}
            />

            {!showFavorites && selectedType === 'all' && totalPokemon > 1 && (
              <Pagination
                page={page}
                totalPages={totalPages}
                disabled={loading}
                onPageChange={(nextPage) => {
                  setPage(nextPage);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
              />
            )}
          </>
        )}
      </main>

      <footer>
        <p>
          Proyecto educativo creado con React, TypeScript y PokéAPI.
        </p>
      </footer>

      {selectedPokemon && (
        <PokemonModal
          pokemon={selectedPokemon}
          favorite={isFavorite(selectedPokemon.id)}
          onToggleFavorite={toggleFavorite}
          onClose={() => setSelectedPokemon(null)}
        />
      )}
    </div>
  );
}

export default App;
