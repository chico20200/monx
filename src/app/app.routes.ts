import { Routes } from '@angular/router';

// Cada pantalla es un componente standalone cargado bajo demanda (lazy loading).
export const routes: Routes = [
  {
    path: 'tabs',
    loadComponent: () => import('./pages/tabs/tabs.page').then((m) => m.TabsPage),
    children: [
      { path: 'explorar', loadComponent: () => import('./pages/explore/explore.page').then((m) => m.ExplorePage) },
      { path: 'comparar', loadComponent: () => import('./pages/compare/compare.page').then((m) => m.ComparePage) },
      { path: 'recientes', loadComponent: () => import('./pages/recents/recents.page').then((m) => m.RecentsPage) },
      { path: '', redirectTo: 'explorar', pathMatch: 'full' },
    ],
  },
  { path: 'pokemon/:id', loadComponent: () => import('./pages/detail/detail.page').then((m) => m.DetailPage) },
  { path: '', redirectTo: 'tabs/explorar', pathMatch: 'full' },
  { path: '**', redirectTo: 'tabs/explorar' },
];
