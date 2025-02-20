import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'lazy-signal',
    loadComponent: () => import('./features/lazy-signal/lazy-signal.component').then(m => m.LazySignalComponent)
  },
  {
    path: 'derived-from',
    loadComponent: () => import('./features/derived-from/derived-from.component').then(m => m.DerivedFromComponent)
  },
  {
    path: 'observable-signal',
    loadComponent: () => import('./features/observable-signal/observable-signal.component').then(m => m.ObservableSignalComponent)
  },
  {
    path: 'derived-async',
    loadComponent: () => import('./features/derived-async/derived-async.component').then(m => m.DerivedAsyncComponent)
  },
  {
    path: 'connect',
    loadComponent: () => import('./features/connect/connect.component').then(m => m.ConnectComponent)
  },
  {
    path: 'signal-slice',
    loadComponent: () => import('./features/signal-slice/signal-slice.component').then(m => m.SignalSliceComponent)
  },
  {
    path: '',
    redirectTo: 'lazy-signal',
    pathMatch: 'full'
  }
];
