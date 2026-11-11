import { Injectable, signal } from '@angular/core';

export interface RecentEntry {
  id: number;
  name: string;
  types: string[];
  fecha: number;
}

/**
 * Historial de Pokémon consultados.
 * Es la evolución del storage.js de PokeWiki: también usa localStorage,
 * pero guarda objetos completos, evita duplicados y limita el tamaño.
 */
@Injectable({ providedIn: 'root' })
export class HistoryService {
  private readonly key = 'monx.recientes';
  private readonly max = 30;
  readonly recientes = signal<RecentEntry[]>(this.leer());

  agregar(entry: Omit<RecentEntry, 'fecha'>): void {
    const lista = [{ ...entry, fecha: Date.now() }, ...this.recientes().filter((r) => r.id !== entry.id)].slice(0, this.max);
    this.recientes.set(lista);
    this.guardar(lista);
  }

  limpiar(): void {
    this.recientes.set([]);
    this.guardar([]);
  }

  private leer(): RecentEntry[] {
    try {
      const raw = localStorage.getItem(this.key);
      return raw ? (JSON.parse(raw) as RecentEntry[]) : [];
    } catch {
      return [];
    }
  }

  private guardar(lista: RecentEntry[]): void {
    try {
      localStorage.setItem(this.key, JSON.stringify(lista));
    } catch {
      /* almacenamiento no disponible: el historial vive solo en memoria */
    }
  }
}
