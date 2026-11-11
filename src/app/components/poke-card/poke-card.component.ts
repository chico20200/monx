import { Component, computed, inject, input, output } from '@angular/core';
import { Pokemon } from '../../models/pokemon.model';
import { PokemonService } from '../../services/pokemon.service';
import { kilos, meters, padId, prettyName } from '../../utils/pokemon-format';
import { StatBarsComponent } from '../stat-bars/stat-bars.component';
import { TypeIconsComponent } from '../type-icons/type-icons.component';

/**
 * Tarjeta completa estilo PokeWiki:
 * borde azul → franja con #ID, nombre y tipos → ventana circular con la imagen
 * → datos (izquierda) y estadísticas (derecha) → descripción como texto de carta.
 */
@Component({
  selector: 'app-poke-card',
  standalone: true,
  imports: [StatBarsComponent, TypeIconsComponent],
  templateUrl: './poke-card.component.html',
  styleUrl: './poke-card.component.scss',
})
export class PokeCardComponent {
  private readonly svc = inject(PokemonService);

  readonly pokemon = input.required<Pokemon>();
  readonly categoria = input('');
  readonly descripcion = input('');
  readonly shiny = input(false);
  /** Se emite al tocar la imagen (para ampliarla). */
  readonly zoom = output<string>();

  readonly imagen = computed(() => this.svc.artwork(this.pokemon(), this.shiny()));
  readonly tipos = computed(() => this.pokemon().types.map((t) => t.type.name));
  readonly tipoPrincipal = computed(() => this.tipos()[0] ?? 'normal');

  padId = padId;
  prettyName = prettyName;
  meters = meters;
  kilos = kilos;

  onImgError(ev: Event) {
    (ev.target as HTMLImageElement).src = 'assets/img/fallback.png';
  }
}
