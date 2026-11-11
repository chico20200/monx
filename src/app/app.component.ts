import { Component, OnInit } from '@angular/core';
import { Capacitor } from '@capacitor/core';
import { SplashScreen } from '@capacitor/splash-screen';
import { StatusBar, Style } from '@capacitor/status-bar';
import { IonApp, IonRouterOutlet } from '@ionic/angular/standalone';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [IonApp, IonRouterOutlet],
  template: '<ion-app><ion-router-outlet></ion-router-outlet></ion-app>',
})
export class AppComponent implements OnInit {
  async ngOnInit(): Promise<void> {
    // Solo en el teléfono: barra de estado azul y ocultar la pantalla de inicio cuando la app ya cargó.
    if (Capacitor.isNativePlatform()) {
      try {
        await StatusBar.setStyle({ style: Style.Dark });
        await StatusBar.setBackgroundColor({ color: '#3a5ca6' });
      } catch {
        /* sin barra de estado configurable */
      }
      await SplashScreen.hide({ fadeOutDuration: 300 });
    }
  }
}
