import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { IonContent, IonHeader, IonIcon, IonTitle, IonToolbar } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { trashOutline } from 'ionicons/icons';
import { APP_NAME, APP_VERSION } from '../../app.info';
import { TypeIconsComponent } from '../../components/type-icons/type-icons.component';
import { HistoryService } from '../../services/history.service';
import { PokemonService } from '../../services/pokemon.service';
import { padId, prettyName } from '../../utils/pokemon-format';

@Component({
  selector: 'app-recents',
  standalone: true,
  imports: [IonHeader, IonToolbar, IonTitle, IonContent, IonIcon, TypeIconsComponent],
  templateUrl: './recents.page.html',
  styleUrl: './recents.page.scss',
})
export class RecentsPage {
  readonly history = inject(HistoryService);
  readonly svc = inject(PokemonService);
  private readonly router = inject(Router);

  readonly appName = APP_NAME;
  readonly version = APP_VERSION;
  padId = padId;
  prettyName = prettyName;

  constructor() {
    addIcons({ trashOutline });
  }

  abrir(id: number): void {
    this.router.navigate(['/pokemon', id]);
  }

  hace(fecha: number): string {
    const min = Math.round((Date.now() - fecha) / 60000);
    if (min < 1) return 'ahora';
    if (min < 60) return `hace ${min} min`;
    const h = Math.round(min / 60);
    if (h < 24) return `hace ${h} h`;
    return new Date(fecha).toLocaleDateString('es-EC');
  }

  onImgError(ev: Event): void {
    (ev.target as HTMLImageElement).src = 'assets/img/fallback.png';
  }
}
