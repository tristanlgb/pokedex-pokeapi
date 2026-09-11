import { lazy, Suspense, useRef } from 'react';
import { BookOpen, FlaskConical, GitCompareArrows, Heart, Users } from 'lucide-react';
import { Header } from './components/Header';
import { Filters } from './components/Filters';
import { PokemonGrid, CatalogSkeleton } from './components/PokemonGrid';
import { Pagination } from './components/Pagination';
import { PokemonModal } from './components/PokemonModal';
import { CollectionView } from './components/CollectionViews';
import { useFavorites } from './hooks/useFavorites';
import { useStoredIds } from './hooks/useStoredIds';
import { useCatalogLocation, type View } from './hooks/useCatalogLocation';
import { PAGE_SIZE, usePokemonCatalog } from './hooks/usePokemonCatalog';
const ResearchLab = lazy(() =>
  import('./components/PokemonResearchLab').then((module) => ({
    default: module.PokemonResearchLab,
  })),
);
const PokeballLab = lazy(() =>
  import('./components/PokeballExperience').then((module) => ({
    default: module.PokeballExperience,
  })),
);
const VIEW_COPY: Record<View, { title: string; subtitle: string }> = {
  explore: {
    title: 'Un mundo por descubrir.',
    subtitle: 'Encuentra a tus favoritos. Compara sus fortalezas. Forma tu próximo equipo.',
  },
  favorites: {
    title: 'Tus favoritos, siempre cerca.',
    subtitle: 'Una colección de los Pokémon que hacen especial tu aventura.',
  },
  compare: {
    title: 'Conoce sus diferencias.',
    subtitle: 'Compara dos Pokémon y encuentra el compañero ideal para tu estrategia.',
  },
  team: {
    title: 'Seis lugares. Tu estrategia.',
    subtitle: 'Construye tu equipo y descubre sus fortalezas y debilidades compartidas.',
  },
  lab: {
    title: 'Un espacio para experimentar.',
    subtitle: 'Explora una Poké Ball en 3D y prueba la investigación de perfiles.',
  },
};
function App() {
  const { location, update } = useCatalogLocation();
  const { favorites, toggleFavorite, storageError } = useFavorites();
  const comparison = useStoredIds('pokedex-comparison', 2);
  const team = useStoredIds('pokedex-team', 6);
  const isCatalog = location.view === 'explore' || location.view === 'favorites';
  const catalog = usePokemonCatalog(location, favorites, isCatalog);
  const catalogRef = useRef<HTMLElement>(null);
  const totalPages = Math.max(1, Math.ceil(catalog.total / PAGE_SIZE));
  const page = Math.min(location.page, totalPages);
  function navigate(view: View) {
    update({ view, page: 1, pokemon: '' });
  }
  function explore() {
    update({ view: 'explore', query: '', type: 'all', generation: 'all', page: 1 });
  }
  const tabs = [
    { view: 'explore' as const, label: 'Explorar', icon: BookOpen },
    { view: 'favorites' as const, label: 'Favoritos', icon: Heart, count: favorites.length },
    {
      view: 'compare' as const,
      label: 'Comparar',
      icon: GitCompareArrows,
      count: comparison.ids.length + '/2',
    },
    { view: 'team' as const, label: 'Mi equipo', icon: Users, count: team.ids.length + '/6' },
    { view: 'lab' as const, label: 'Laboratorio', icon: FlaskConical },
  ];
  return (
    <div className="app-shell">
      <a href="#catalog" className="skip-link">
        Ir al contenido
      </a>
      <Header
        query={location.query}
        onSearch={(query) =>
          update({ query, page: 1, view: 'explore', type: 'all', generation: 'all', pokemon: '' })
        }
      />
      <main>
        <nav className="view-nav" aria-label="Secciones de la Pokédex">
          {tabs.map(({ view, label, icon: Icon, count }) => (
            <button
              key={view}
              aria-current={location.view === view ? 'page' : undefined}
              onClick={() => navigate(view)}
            >
              <Icon size={17} />
              <span>{label}</span>
              {count !== undefined && <small>{count}</small>}
            </button>
          ))}
        </nav>
        <section className="intro">
          <div>
            <span className="eyebrow">Tu guía Pokémon</span>
            <h2>{VIEW_COPY[location.view].title}</h2>
            <p>{VIEW_COPY[location.view].subtitle}</p>
          </div>
          <div className="intro-emblem" aria-hidden="true">
            <div className="pokeball">
              <span />
            </div>
          </div>
        </section>
        {(storageError || comparison.storageError || team.storageError) && (
          <p role="status" className="storage-notice">
            {storageError || comparison.storageError || team.storageError}
          </p>
        )}
        <section id="catalog" ref={catalogRef} tabIndex={-1}>
          {isCatalog && (
            <>
              <Filters location={location} onChange={(patch) => update({ ...patch, page: 1 })} />
              <div className="section-heading">
                <h2>
                  {location.query
                    ? 'Resultados para “' + location.query + '”'
                    : location.view === 'favorites'
                      ? 'Tu colección'
                      : 'Pokédex nacional'}
                </h2>
                <span aria-live="polite">
                  {catalog.loading
                    ? 'Buscando Pokémon…'
                    : catalog.error
                      ? 'Sin conexión'
                      : catalog.total + ' Pokémon'}
                </span>
              </div>
              {catalog.loading && (
                <>
                  <p role="status" className="loading-label">
                    {location.sort === 'total' || location.sort === 'speed'
                      ? 'Preparando el orden global · ' +
                        catalog.progress +
                        ' perfiles cargados. Puedes cambiar los filtros para cancelar.'
                      : 'Cargando Pokémon…'}
                  </p>
                  <CatalogSkeleton />
                </>
              )}
              {!catalog.loading && catalog.error && (
                <div className="error-state" role="alert">
                  <h3>No pudimos cargar el catálogo</h3>
                  <p>{catalog.error}</p>
                  <button className="primary-button" onClick={catalog.retry}>
                    Reintentar
                  </button>
                </div>
              )}
              {!catalog.loading &&
                !catalog.error &&
                (catalog.total ? (
                  <>
                    <PokemonGrid
                      pokemon={catalog.pokemon}
                      favorites={favorites}
                      comparing={comparison.ids}
                      team={team.ids}
                      onToggleFavorite={toggleFavorite}
                      onCompare={comparison.toggle}
                      onTeam={team.toggle}
                      onOpen={(pokemon) => update({ pokemon: String(pokemon.id) })}
                    />
                    {totalPages > 1 && (
                      <Pagination
                        page={page}
                        totalPages={totalPages}
                        disabled={catalog.loading}
                        onPageChange={(nextPage) => {
                          update({ page: nextPage });
                          catalogRef.current?.scrollIntoView({
                            behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches
                              ? 'instant'
                              : 'smooth',
                            block: 'start',
                          });
                        }}
                      />
                    )}
                  </>
                ) : (
                  <div className="empty-state">
                    <Heart size={34} />
                    <h3>
                      {location.view === 'favorites' && !favorites.length
                        ? 'Todavía no guardaste favoritos'
                        : 'No encontramos coincidencias'}
                    </h3>
                    <p>
                      {location.view === 'favorites' && !favorites.length
                        ? 'Toca el corazón de una tarjeta para comenzar tu colección.'
                        : 'Prueba otro nombre o restablece los filtros.'}
                    </p>
                    <button className="primary-button" onClick={explore}>
                      Explorar todos
                    </button>
                  </div>
                ))}
            </>
          )}
          {(location.view === 'compare' || location.view === 'team') && (
            <CollectionView
              mode={location.view}
              ids={location.view === 'compare' ? comparison.ids : team.ids}
              onRemove={location.view === 'compare' ? comparison.toggle : team.toggle}
              onOpen={(pokemon) => update({ pokemon: String(pokemon.id) })}
              onExplore={explore}
            />
          )}
          {location.view === 'lab' && (
            <Suspense fallback={<p role="status">Preparando laboratorio…</p>}>
              <ResearchLab />
              <PokeballLab />
            </Suspense>
          )}
        </section>
      </main>
      <footer>
        Hecho para explorar. Datos de{' '}
        <a href="https://pokeapi.co/" target="_blank" rel="noreferrer">
          PokéAPI
        </a>{' '}
        · Pokémon pertenece a sus respectivos titulares.
      </footer>
      {location.pokemon && (
        <PokemonModal
          name={location.pokemon}
          favorites={favorites}
          onToggleFavorite={toggleFavorite}
          onClose={() => update({ pokemon: '' }, true)}
          onNavigate={(id) => update({ pokemon: id })}
        />
      )}
    </div>
  );
}
export default App;
