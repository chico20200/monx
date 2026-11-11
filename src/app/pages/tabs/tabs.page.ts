import { Component } from '@angular/core';
import { IonIcon, IonLabel, IonTabBar, IonTabButton, IonTabs } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { gridOutline, gitCompareOutline, timeOutline } from 'ionicons/icons';

@Component({
  selector: 'app-tabs',
  standalone: true,
  imports: [IonTabs, IonTabBar, IonTabButton, IonIcon, IonLabel],
  template: `
    <ion-tabs>
      <ion-tab-bar slot="bottom">
        <ion-tab-button tab="explorar">
          <ion-icon name="grid-outline" />
          <ion-label>Explorar</ion-label>
        </ion-tab-button>
        <ion-tab-button tab="comparar">
          <ion-icon name="git-compare-outline" />
          <ion-label>Comparar</ion-label>
        </ion-tab-button>
        <ion-tab-button tab="recientes">
          <ion-icon name="time-outline" />
          <ion-label>Recientes</ion-label>
        </ion-tab-button>
      </ion-tab-bar>
    </ion-tabs>
  `,
  styles: `
    ion-tab-bar { border-top: 4px solid var(--monx-yellow); height: 62px; }
    ion-label { font-family: var(--monx-font-pixel); font-size: .85rem; }
  `,
})
export class TabsPage {
  constructor() {
    addIcons({ gridOutline, gitCompareOutline, timeOutline });
  }
}
