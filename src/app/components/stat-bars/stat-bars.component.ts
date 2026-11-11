import { Component, computed, input } from '@angular/core';
import { Pokemon } from '../../models/pokemon.model';
import { STAT_KEYS, STAT_LABELS, STAT_MAX } from '../../utils/pokemon-format';

/** Estadísticas base en barras (versión gráfica de la lista de stats de PokeWiki). */
@Component({
  selector: 'app-stat-bars',
  standalone: true,
  template: `
    @for (s of stats(); track s.key) {
      <div class="row">
        <span class="label">{{ s.label }}</span>
        <span class="value num">{{ s.value }}</span>
        <div class="track"><div class="fill" [style.width.%]="s.pct" [class.high]="s.value >= 100"></div></div>
      </div>
    }
    <div class="total"><span>Total</span><strong class="num">{{ total() }}</strong></div>
  `,
  styles: `
    :host { display: block; font-family: var(--monx-font-text); }
    .row { display: grid; grid-template-columns: 1fr auto; align-items: center; column-gap: 6px; margin-bottom: 6px; }
    .label { font-size: .74rem; font-weight: 600; }
    .value { font-family: var(--monx-font-pixel); font-size: .9rem; }
    .track { grid-column: 1 / -1; height: 8px; background: #f4f4f2; border-radius: 4px; border: 1px solid #9a9a9a; overflow: hidden; }
    .fill { height: 100%; background: var(--monx-blue); transition: width .5s ease; }
    .fill.high { background: var(--monx-yellow-dark); }
    .total { display: flex; justify-content: space-between; border-top: 2px dashed #9a9a9a; padding-top: 5px; margin-top: 2px;
      font-size: .8rem; strong { font-family: var(--monx-font-pixel); font-size: 1rem; } }
  `,
})
export class StatBarsComponent {
  readonly pokemon = input.required<Pokemon>();
  readonly stats = computed(() =>
    STAT_KEYS.map((key) => {
      const value = this.pokemon().stats.find((s) => s.stat.name === key)?.base_stat ?? 0;
      return { key, label: STAT_LABELS[key], value, pct: Math.round((value / STAT_MAX) * 100) };
    }),
  );
  readonly total = computed(() => this.stats().reduce((acc, s) => acc + s.value, 0));
}
