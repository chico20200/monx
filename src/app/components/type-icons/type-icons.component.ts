import { Component, input } from '@angular/core';
import { typeColor, typeIcon, typeName } from '../../utils/pokemon-format';

/** Íconos de tipo (como en la franja de PokeWiki) o chips con nombre en español. */
@Component({
  selector: 'app-type-icons',
  standalone: true,
  template: `
    @if (mode() === 'icon') {
      @for (t of types(); track t) {
        <img class="icon" [src]="icon(t)" [alt]="name(t)" [title]="name(t)" [style.width.px]="size()" [style.height.px]="size()" />
      }
    } @else {
      @for (t of types(); track t) {
        <span class="chip" [style.background]="color(t)">
          <img [src]="icon(t)" alt="" />{{ name(t) }}
        </span>
      }
    }
  `,
  styles: `
    :host { display: inline-flex; gap: 4px; align-items: center; flex-wrap: wrap; }
    .icon { object-fit: contain; filter: drop-shadow(1px 1px 0 rgba(0,0,0,.35)); }
    .chip {
      display: inline-flex; align-items: center; gap: 4px;
      padding: 2px 9px 2px 3px; border-radius: 999px;
      font-family: var(--monx-font-pixel); font-size: .85rem; color: #fff;
      text-shadow: 1px 1px 0 rgba(0,0,0,.45);
      border-bottom: 2px solid rgba(0,0,0,.35);
      img { width: 18px; height: 18px; }
    }
  `,
})
export class TypeIconsComponent {
  readonly types = input.required<string[]>();
  readonly mode = input<'icon' | 'chip'>('icon');
  readonly size = input(26);
  icon = typeIcon;
  name = typeName;
  color = typeColor;
}
