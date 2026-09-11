import { useEffect, useState } from 'react';
import { TYPE_LABELS } from '../lib/pokemon';
export type View = 'explore' | 'favorites' | 'compare' | 'team' | 'lab';
export type Sort = 'number' | 'name' | 'total' | 'speed';
export interface CatalogLocation {
  view: View;
  type: string;
  generation: string;
  sort: Sort;
  query: string;
  page: number;
  pokemon: string;
}
const views: View[] = ['explore', 'favorites', 'compare', 'team', 'lab'];
const sorts: Sort[] = ['number', 'name', 'total', 'speed'];
export function readLocation(): CatalogLocation {
  const p = new URLSearchParams(window.location.search);
  const page = Number(p.get('page'));
  return {
    view: views.includes(p.get('view') as View) ? (p.get('view') as View) : 'explore',
    type:
      p.get('type') && Object.prototype.hasOwnProperty.call(TYPE_LABELS, p.get('type') ?? '')
        ? p.get('type')!
        : 'all',
    generation: /^[1-9]$/.test(p.get('generation') ?? '') ? p.get('generation')! : 'all',
    sort: sorts.includes(p.get('sort') as Sort) ? (p.get('sort') as Sort) : 'number',
    query: (p.get('q') ?? '').slice(0, 80),
    page: Number.isSafeInteger(page) && page > 0 ? page : 1,
    pokemon: (p.get('pokemon') ?? '').slice(0, 80),
  };
}
export function useCatalogLocation() {
  const [location, setLocation] = useState(readLocation);
  useEffect(() => {
    const sync = () => setLocation(readLocation());
    window.addEventListener('popstate', sync);
    return () => window.removeEventListener('popstate', sync);
  }, []);
  function update(patch: Partial<CatalogLocation>, replace = false) {
    const next = { ...readLocation(), ...patch };
    const params = new URLSearchParams();
    if (next.view !== 'explore') params.set('view', next.view);
    if (next.type !== 'all') params.set('type', next.type);
    if (next.generation !== 'all') params.set('generation', next.generation);
    if (next.sort !== 'number') params.set('sort', next.sort);
    if (next.query) params.set('q', next.query);
    if (next.page > 1) params.set('page', String(next.page));
    if (next.pokemon) params.set('pokemon', next.pokemon);
    const search = params.toString();
    window.history[replace ? 'replaceState' : 'pushState'](
      null,
      '',
      window.location.pathname + (search ? '?' + search : ''),
    );
    setLocation(next);
  }
  return { location, update };
}
