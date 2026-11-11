import { Component, OnDestroy, OnInit, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { IonContent, IonHeader, IonIcon, IonSpinner, IonTitle, IonToolbar } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { diceOutline, swapHorizontalOutline } from 'ionicons/icons';
import { Subscription, forkJoin } from 'rxjs';
import { MiniCardComponent } from '../../components/mini-card/mini-card.component';
import { TypeIconsComponent } from '../../components/type-icons/type-icons.component';
import { IndexEntry, Pokemon } from '../../models/pokemon.model';
import { PokemonService } from '../../services/pokemon.service';
import { STAT_KEYS, STAT_LABELS, kilos, meters, prettyName } from '../../utils/pokemon-format';

type Lado = 'a' | 'b';

interface Fila {
  label: string;
  a: number;
  b: number;
  textoA: string;
  textoB: string;
  pctA: number;
  pctB: number;
  gana: Lado | 'empate';
  esStat: boolean;
}

const stat = (p: Pokemon, k: string) => p.stats.find((s) => s.stat.name === k)?.base_stat ?? 0;
const normalizar = (t: string) =>
  t.trim().toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/\s+/g, '-').replace(/^#0*/, '');

@Component({
  selector: 'app-compare',
  standalone: true,
  imports: [IonHeader, IonToolbar, IonTitle, IonContent, IonIcon, IonSpinner, MiniCardComponent, TypeIconsComponent],
  templateUrl: './compare.page.html',
  styleUrl: './compare.page.scss',
})
export class ComparePage implements OnInit, OnDestroy {
  private readonly svc = inject(PokemonService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  readonly lados: Lado[] = ['a', 'b'];
  readonly indice = signal<IndexEntry[]>([]);
  readonly texto = { a: signal('pikachu'), b: signal('charizard') };
  readonly foco = signal<Lado | null>(null);
  readonly pokemonA = signal<Pokemon | null>(null);
  readonly pokemonB = signal<Pokemon | null>(null);
  readonly cargando = signal(false);
  readonly error = signal('');

  readonly sugerencias = computed(() => {
    const lado = this.foco();
    if (!lado) return [];
    const q = normalizar(this.texto[lado]());
    if (!q) return [];
    return this.indice()
      .filter((p) => p.name.includes(q) || String(p.id) === q)
      .slice(0, 6);
  });

  readonly filas = computed<Fila[]>(() => {
    const a = this.pokemonA();
    const b = this.pokemonB();
    if (!a || !b) return [];
    const fila = (label: string, va: number, vb: number, ta: string, tb: string, esStat: boolean): Fila => {
      const max = Math.max(va, vb, 1);
      return {
        label, a: va, b: vb, textoA: ta, textoB: tb, esStat,
        pctA: Math.round((va / max) * 100),
        pctB: Math.round((vb / max) * 100),
        gana: va === vb ? 'empate' : va > vb ? 'a' : 'b',
      };
    };
    const filas = [
      fila('Altura', a.height, b.height, meters(a.height), meters(b.height), false),
      fila('Peso', a.weight, b.weight, kilos(a.weight), kilos(b.weight), false),
      ...STAT_KEYS.map((k) => fila(STAT_LABELS[k], stat(a, k), stat(b, k), String(stat(a, k)), String(stat(b, k)), true)),
    ];
    const totA = STAT_KEYS.reduce((s, k) => s + stat(a, k), 0);
    const totB = STAT_KEYS.reduce((s, k) => s + stat(b, k), 0);
    filas.push(fila('Total', totA, totB, String(totA), String(totB), false));
    return filas;
  });

  readonly resumen = computed(() => {
    const a = this.pokemonA();
    const b = this.pokemonB();
    if (!a || !b) return '';
    const stats = this.filas().filter((f) => f.esStat);
    const ga = stats.filter((f) => f.gana === 'a').length;
    const gb = stats.filter((f) => f.gana === 'b').length;
    if (ga === gb) return `¡Empate! Cada uno gana en ${ga} de 6 estadísticas.`;
    const [ganador, n] = ga > gb ? [a, ga] : [b, gb];
    return `${prettyName(ganador.name)} gana en ${n} de 6 estadísticas.`;
  });

  private subs = new Subscription();
  prettyName = prettyName;

  constructor() {
    addIcons({ diceOutline, swapHorizontalOutline });
  }

  ngOnInit(): void {
    this.svc.indice().subscribe({ next: (l) => this.indice.set(l), error: () => {} });
    // Permite llegar desde el detalle: /tabs/comparar?a=pikachu
    this.subs.add(
      this.route.queryParamMap.subscribe((q) => {
        if (q.get('a')) this.texto.a.set(q.get('a')!);
        if (q.get('b')) this.texto.b.set(q.get('b')!);
        this.comparar();
      }),
    );
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }

  escribir(lado: Lado, valor: string): void {
    this.texto[lado].set(valor);
    this.foco.set(lado);
  }

  elegir(lado: Lado, p: IndexEntry): void {
    this.texto[lado].set(p.name);
    this.foco.set(null);
    this.comparar();
  }

  aleatorio(lado: Lado): void {
    const id = 1 + Math.floor(Math.random() * this.svc.total);
    const entry = this.indice().find((p) => p.id === id);
    this.texto[lado].set(entry?.name ?? String(id));
    this.comparar();
  }

  intercambiar(): void {
    const a = this.texto.a();
    this.texto.a.set(this.texto.b());
    this.texto.b.set(a);
    this.comparar();
  }

  cerrarSugerencias(): void {
    // pequeño retraso para que el toque en una sugerencia alcance a registrarse
    setTimeout(() => this.foco.set(null), 180);
  }

  comparar(): void {
    const a = normalizar(this.texto.a());
    const b = normalizar(this.texto.b());
    this.foco.set(null);
    if (!a || !b) {
      this.error.set('Elige dos Pokémon para comparar.');
      return;
    }
    if (a === b) {
      this.error.set('Elige dos Pokémon diferentes.');
      return;
    }
    this.cargando.set(true);
    this.error.set('');
    forkJoin([this.svc.obtener(a), this.svc.obtener(b)]).subscribe({
      next: ([pa, pb]) => {
        this.cargando.set(false);
        if (pa.id === pb.id) {
          this.error.set('Elige dos Pokémon diferentes.');
          return;
        }
        this.pokemonA.set(pa);
        this.pokemonB.set(pb);
      },
      error: (e: { status?: number }) => {
        this.cargando.set(false);
        this.error.set(
          e?.status === 404
            ? 'Uno de los nombres no existe. Elige de las sugerencias.'
            : 'No se pudo completar la comparación. Revisa tu conexión.',
        );
      },
    });
  }

  verDetalle(p: Pokemon): void {
    this.router.navigate(['/pokemon', p.id]);
  }

  tipos(p: Pokemon): string[] {
    return p.types.map((t) => t.type.name);
  }
}
