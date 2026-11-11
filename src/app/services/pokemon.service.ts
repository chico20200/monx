import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, map, shareReplay, throwError } from 'rxjs';
import { GalleryImage, IndexEntry, Pokemon, PokemonList, PokemonSpecies } from '../models/pokemon.model';

/**
 * Servicio de acceso a PokéAPI.
 * - Guarda en caché cada respuesta (PokéAPI pide no repetir peticiones innecesarias).
 * - Si una petición falla, se borra de la caché para poder reintentar.
 */
@Injectable({ providedIn: 'root' })
export class PokemonService {
  private readonly http = inject(HttpClient);
  private readonly api = 'https://pokeapi.co/api/v2';

  /** Pokémon de la Pokédex nacional (sin formas alternativas). */
  readonly total = 1025;

  private index$?: Observable<IndexEntry[]>;
  private readonly pokemonCache = new Map<string, Observable<Pokemon>>();
  private readonly speciesCache = new Map<number, Observable<PokemonSpecies>>();

  /** Índice ligero de los 1025 Pokémon (una sola petición): sirve para listar y buscar. */
  indice(): Observable<IndexEntry[]> {
    if (!this.index$) {
      this.index$ = this.http.get<PokemonList>(`${this.api}/pokemon?limit=${this.total}&offset=0`).pipe(
        map((r) => r.results.map((x) => ({ name: x.name, id: this.idDesdeUrl(x.url) }))),
        catchError((e) => {
          this.index$ = undefined;
          return throwError(() => e);
        }),
        shareReplay(1),
      );
    }
    return this.index$;
  }

  /** Detalle completo de un Pokémon por nombre o id. */
  obtener(nombreOId: string | number): Observable<Pokemon> {
    const key = String(nombreOId).trim().toLowerCase();
    return this.memo(this.pokemonCache, key, () => this.http.get<Pokemon>(`${this.api}/pokemon/${key}`));
  }

  /** Datos de especie: categoría ("Pokémon Ratón") y descripción en español. */
  especie(id: number): Observable<PokemonSpecies> {
    return this.memo(this.speciesCache, id, () => this.http.get<PokemonSpecies>(`${this.api}/pokemon-species/${id}`));
  }

  // ------------------------------------------------------------------ imágenes

  imagenPorId(id: number): string {
    return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${id}.png`;
  }

  artwork(p: Pokemon, shiny = false): string {
    const o = p.sprites.other;
    const url = shiny
      ? o?.['official-artwork']?.front_shiny ?? o?.home?.front_shiny ?? p.sprites.front_shiny
      : o?.['official-artwork']?.front_default ?? o?.home?.front_default ?? p.sprites.front_default;
    return url ?? 'assets/img/fallback.png';
  }

  /** Galería sin duplicados; la mayoría de Pokémon tiene 8 imágenes. */
  galeria(p: Pokemon): GalleryImage[] {
    const o = p.sprites.other;
    const fuentes: [string | null | undefined, string][] = [
      [o?.['official-artwork']?.front_default, 'Arte oficial'],
      [o?.['official-artwork']?.front_shiny, 'Arte oficial shiny'],
      [o?.home?.front_default, 'HOME'],
      [o?.home?.front_shiny, 'HOME shiny'],
      [p.sprites.front_default, 'Sprite frontal'],
      [p.sprites.back_default, 'Sprite trasero'],
      [p.sprites.front_shiny, 'Frontal shiny'],
      [p.sprites.back_shiny, 'Trasero shiny'],
    ];
    const vistos = new Set<string>();
    return fuentes
      .filter((f): f is [string, string] => !!f[0] && !vistos.has(f[0]) && !!vistos.add(f[0]))
      .map(([url, label]) => ({ url, label }));
  }

  /** Animaciones GIF (sprites de Showdown); no existen para todos los Pokémon. */
  animaciones(p: Pokemon): GalleryImage[] {
    const s = p.sprites.other?.showdown;
    return [
      { url: s?.front_default, label: 'Frente' },
      { url: s?.back_default, label: 'Espalda' },
      { url: s?.front_shiny, label: 'Shiny' },
    ].filter((a): a is GalleryImage => !!a.url);
  }

  sonido(p: Pokemon): string | null {
    return p.cries?.latest ?? p.cries?.legacy ?? null;
  }

  // ------------------------------------------------------------------ especie

  descripcion(s: PokemonSpecies): string {
    const textos = s.flavor_text_entries.filter((f) => f.language.name === 'es');
    const t = textos[textos.length - 1] ?? s.flavor_text_entries.find((f) => f.language.name === 'en');
    return t ? t.flavor_text.replace(/[\n\f\r­]+/g, ' ').replace(/\s+/g, ' ').trim() : '';
  }

  categoria(s: PokemonSpecies): string {
    return s.genera.find((g) => g.language.name === 'es')?.genus ?? '';
  }

  // ------------------------------------------------------------------ utilidades

  private idDesdeUrl(url: string): number {
    return Number(url.match(/\/(\d+)\/?$/)?.[1] ?? 0);
  }

  private memo<K, T>(cache: Map<K, Observable<T>>, key: K, factory: () => Observable<T>): Observable<T> {
    let obs = cache.get(key);
    if (!obs) {
      obs = factory().pipe(
        catchError((e) => {
          cache.delete(key);
          return throwError(() => e);
        }),
        shareReplay(1),
      );
      cache.set(key, obs);
    }
    return obs;
  }
}
