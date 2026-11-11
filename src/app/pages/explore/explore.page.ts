import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import {
  InfiniteScrollCustomEvent,
  IonContent,
  IonHeader,
  IonIcon,
  IonInfiniteScroll,
  IonInfiniteScrollContent,
  IonSpinner,
  IonToast,
  IonToolbar,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { diceOutline, searchOutline } from 'ionicons/icons';
import { MiniCardComponent } from '../../components/mini-card/mini-card.component';
import { IndexEntry } from '../../models/pokemon.model';
import { PokemonService } from '../../services/pokemon.service';

const PAGINA = 24;

/** Normaliza texto para buscar: minúsculas, sin tildes, espacios → guiones (formato de PokéAPI). */
const normalizar = (t: string) =>
  t.trim().toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/\s+/g, '-').replace(/^#0*/, '');

@Component({
  selector: 'app-explore',
  standalone: true,
  imports: [IonHeader, IonToolbar, IonContent, IonIcon, IonSpinner, IonInfiniteScroll, IonInfiniteScrollContent, IonToast, MiniCardComponent],
  templateUrl: './explore.page.html',
  styleUrl: './explore.page.scss',
})
export class ExplorePage implements OnInit {
  private readonly svc = inject(PokemonService);
  private readonly router = inject(Router);

  readonly indice = signal<IndexEntry[]>([]);
  readonly cargando = signal(true);
  readonly error = signal('');
  readonly toast = signal('');
  readonly query = signal('');
  readonly cantidad = signal(PAGINA);

  readonly filtrados = computed(() => {
    const q = normalizar(this.query());
    if (!q) return this.indice();
    if (/^\d+$/.test(q)) return this.indice().filter((p) => String(p.id).startsWith(q));
    return this.indice().filter((p) => p.name.includes(q));
  });
  readonly visibles = computed(() => this.filtrados().slice(0, this.cantidad()));
  readonly hayMas = computed(() => this.cantidad() < this.filtrados().length);

  constructor() {
    addIcons({ searchOutline, diceOutline });
  }

  ngOnInit(): void {
    this.cargar();
  }

  cargar(): void {
    this.cargando.set(true);
    this.error.set('');
    this.svc.indice().subscribe({
      next: (lista) => {
        this.indice.set(lista);
        this.cargando.set(false);
      },
      error: () => {
        this.error.set('No se pudo cargar el listado. Revisa tu conexión a internet.');
        this.cargando.set(false);
      },
    });
  }

  onInput(valor: string): void {
    this.query.set(valor);
    this.cantidad.set(PAGINA);
  }

  /** Enter o botón Buscar: si hay coincidencia exacta abre el detalle. */
  buscar(): void {
    const q = normalizar(this.query());
    if (!q) {
      this.toast.set('Escribe un nombre o número.');
      return;
    }
    const exacto = this.indice().find((p) => p.name === q || String(p.id) === q);
    if (exacto) {
      this.abrir(exacto.id);
    } else if (this.filtrados().length === 1) {
      this.abrir(this.filtrados()[0].id);
    } else if (!this.filtrados().length) {
      this.toast.set(`No encontramos "${this.query().trim()}". Prueba otro nombre o número.`);
    }
  }

  aleatorio(): void {
    this.abrir(1 + Math.floor(Math.random() * this.svc.total));
  }

  abrir(id: number): void {
    this.router.navigate(['/pokemon', id]);
  }

  masResultados(ev: InfiniteScrollCustomEvent): void {
    this.cantidad.update((n) => n + PAGINA);
    setTimeout(() => ev.target.complete(), 150);
  }
}
