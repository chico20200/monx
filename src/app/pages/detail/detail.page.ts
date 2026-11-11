import { Component, OnDestroy, OnInit, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import {
  IonBackButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonIcon,
  IonModal,
  IonSpinner,
  IonTitle,
  IonToast,
  IonToolbar,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  chevronBackOutline,
  chevronForwardOutline,
  closeOutline,
  gitCompareOutline,
  imagesOutline,
  filmOutline,
  sparklesOutline,
  stopOutline,
  volumeHighOutline,
} from 'ionicons/icons';
import { Subscription, catchError, of } from 'rxjs';
import { PokeCardComponent } from '../../components/poke-card/poke-card.component';
import { Pokemon } from '../../models/pokemon.model';
import { HistoryService } from '../../services/history.service';
import { PokemonService } from '../../services/pokemon.service';
import { padId, prettyName } from '../../utils/pokemon-format';

@Component({
  selector: 'app-detail',
  standalone: true,
  imports: [IonHeader, IonToolbar, IonButtons, IonBackButton, IonTitle, IonContent, IonIcon, IonSpinner, IonModal, IonToast, PokeCardComponent],
  templateUrl: './detail.page.html',
  styleUrl: './detail.page.scss',
})
export class DetailPage implements OnInit, OnDestroy {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  readonly svc = inject(PokemonService);
  private readonly history = inject(HistoryService);

  readonly pokemon = signal<Pokemon | null>(null);
  readonly categoria = signal('');
  readonly descripcion = signal('');
  readonly cargando = signal(true);
  readonly error = signal('');
  readonly toast = signal('');
  readonly shiny = signal(false);
  readonly sonando = signal(false);
  readonly zoomUrl = signal<string | null>(null);
  readonly zoomGrande = signal(false);

  readonly galeria = computed(() => (this.pokemon() ? this.svc.galeria(this.pokemon()!) : []));
  readonly animaciones = computed(() => (this.pokemon() ? this.svc.animaciones(this.pokemon()!) : []));
  readonly tieneSonido = computed(() => !!(this.pokemon() && this.svc.sonido(this.pokemon()!)));

  private audio: HTMLAudioElement | null = null;
  private subs = new Subscription();
  private idActual = '';

  padId = padId;
  prettyName = prettyName;

  constructor() {
    addIcons({
      volumeHighOutline, stopOutline, sparklesOutline, gitCompareOutline, imagesOutline, filmOutline,
      chevronBackOutline, chevronForwardOutline, closeOutline,
    });
  }

  ngOnInit(): void {
    // paramMap es un Observable: si se navega de #24 a #25 en la misma página, se recarga.
    this.subs.add(this.route.paramMap.subscribe((pm) => this.cargar(pm.get('id') ?? '1')));
  }

  ngOnDestroy(): void {
    this.detenerSonido();
    this.subs.unsubscribe();
  }

  ionViewWillLeave(): void {
    this.detenerSonido();
  }

  cargar(id: string): void {
    this.idActual = id;
    this.detenerSonido();
    this.cargando.set(true);
    this.error.set('');
    this.shiny.set(false);
    this.categoria.set('');
    this.descripcion.set('');

    this.svc.obtener(id).subscribe({
      next: (p) => {
        this.pokemon.set(p);
        this.cargando.set(false);
        this.history.agregar({ id: p.id, name: p.name, types: p.types.map((t) => t.type.name) });
        // La especie es opcional: si falla, la tarjeta se muestra sin descripción.
        this.svc.especie(p.id).pipe(catchError(() => of(null))).subscribe((s) => {
          if (s && this.pokemon()?.id === p.id) {
            this.categoria.set(this.svc.categoria(s));
            this.descripcion.set(this.svc.descripcion(s));
          }
        });
      },
      error: (e: { status?: number }) => {
        this.pokemon.set(null);
        this.cargando.set(false);
        this.error.set(
          e?.status === 404
            ? `No existe un Pokémon llamado “${id}”.`
            : 'No se pudo cargar la información. Revisa tu conexión a internet.',
        );
      },
    });
  }

  reintentar(): void {
    this.cargar(this.idActual);
  }

  // ------------------------------------------------------------- multimedia

  alternarSonido(): void {
    const p = this.pokemon();
    if (!p) return;
    if (this.sonando()) {
      this.detenerSonido();
      return;
    }
    const url = this.svc.sonido(p);
    if (!url) {
      this.toast.set('Este Pokémon no tiene sonido disponible.');
      return;
    }
    this.audio = new Audio(url);
    this.audio.volume = 0.6;
    this.audio.onended = () => this.sonando.set(false);
    this.audio
      .play()
      .then(() => this.sonando.set(true))
      .catch(() => {
        this.sonando.set(false);
        this.toast.set('No se pudo reproducir el sonido.');
      });
  }

  private detenerSonido(): void {
    this.audio?.pause();
    this.audio = null;
    this.sonando.set(false);
  }

  ampliar(url: string): void {
    this.zoomGrande.set(false);
    this.zoomUrl.set(url);
  }

  onImgError(ev: Event): void {
    (ev.target as HTMLImageElement).src = 'assets/img/fallback.png';
  }

  // ------------------------------------------------------------- navegación

  irA(delta: number): void {
    const p = this.pokemon();
    if (!p) return;
    const siguiente = p.id + delta;
    if (siguiente >= 1 && siguiente <= this.svc.total) {
      this.router.navigate(['/pokemon', siguiente], { replaceUrl: true });
    }
  }

  comparar(): void {
    const p = this.pokemon();
    if (p) this.router.navigate(['/tabs/comparar'], { queryParams: { a: p.name } });
  }
}
