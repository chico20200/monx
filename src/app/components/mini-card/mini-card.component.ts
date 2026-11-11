import { Component, OnInit, computed, inject, input, signal } from '@angular/core';
import { Pokemon } from '../../models/pokemon.model';
import { PokemonService } from '../../services/pokemon.service';
import { padId, prettyName } from '../../utils/pokemon-format';
import { TypeIconsComponent } from '../type-icons/type-icons.component';

/**
 * Mini tarjeta para la cuadrícula del listado y para la comparación.
 * Si no recibe el Pokémon completo, carga solo sus tipos (con caché).
 */
@Component({
  selector: 'app-mini-card',
  standalone: true,
  imports: [TypeIconsComponent],
  template: `
    <article class="mini" [class.highlight]="highlight()">
      <header class="band">
        <span class="id">{{ padId(id()) }}</span>
        <app-type-icons [types]="tipos()" [size]="20" />
      </header>
      <div class="circle">
        <img [src]="imagen()" [alt]="name()" loading="lazy" (error)="onImgError($event)" />
      </div>
      <h3>{{ prettyName(name()) }}</h3>
    </article>
  `,
  styles: `
    :host { display: block; }
    .mini {
      background: var(--monx-card);
      border: 3px solid var(--monx-blue);
      border-radius: 10px;
      overflow: hidden;
      box-shadow: 4px 4px 0 rgba(16, 24, 47, 0.55);
      transition: transform 120ms ease;
      font-family: var(--monx-font-pixel);
      color: var(--monx-ink);
      &:active { transform: scale(0.96) rotate(-1deg); }
      &.highlight { border-color: var(--monx-yellow); }
    }
    .band {
      display: flex; justify-content: space-between; align-items: center;
      background: var(--monx-blue); color: var(--monx-card);
      padding: 3px 6px; min-height: 28px;
      .id { font-family: var(--monx-font-text); font-size: .78rem; }
    }
    .circle {
      width: 98px; height: 98px; margin: 10px auto 4px; border-radius: 50%;
      background: var(--monx-window); display: flex; align-items: center; justify-content: center;
      img { width: 118px; height: 118px; object-fit: contain; }
    }
    h3 { margin: 2px 6px 10px; text-align: center; font-size: 1.02rem; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  `,
})
export class MiniCardComponent implements OnInit {
  private readonly svc = inject(PokemonService);

  readonly id = input.required<number>();
  readonly name = input.required<string>();
  /** Opcional: si ya se tiene el Pokémon completo, no se hace otra petición. */
  readonly data = input<Pokemon | null>(null);
  readonly highlight = input(false);

  private readonly cargado = signal<Pokemon | null>(null);
  readonly tipos = computed(() => (this.data() ?? this.cargado())?.types.map((t) => t.type.name) ?? []);
  readonly imagen = computed(() => {
    const p = this.data();
    return p ? this.svc.artwork(p) : this.svc.imagenPorId(this.id());
  });

  padId = padId;
  prettyName = prettyName;

  ngOnInit(): void {
    if (!this.data()) {
      this.svc.obtener(this.id()).subscribe({ next: (p) => this.cargado.set(p), error: () => {} });
    }
  }

  onImgError(ev: Event) {
    (ev.target as HTMLImageElement).src = 'assets/img/fallback.png';
  }
}
