import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'signal',
    loadComponent: () => import('./features/signal/signal-demo/signal-demo.component').then(m => m.SignalDemoComponent)
  },
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
    path: 'connect-ex',
    loadComponent: () => import('./features/connect/connect-ex.component').then(m => m.ConnectExComponent)
  },
  {
    path: 'signal-slice',
    loadComponent: () => import('./features/signal-slice/signal-slice.component').then(m => m.SignalSliceComponent)
  },
  {
    path: 'linked-signal',
    loadComponent: () => import('./features/linked-signal-demo/linked-signal-demo.component').then(m => m.LinkedSignalDemoComponent)
  },
  {
    path: 'timeout-demo',
    loadComponent: () => import('./features/signal-demos/timeout-demo.component').then(m => m.TimeoutDemoComponent)
  },
  {
    path: 'interval-demo',
    loadComponent: () => import('./features/signal-demos/interval-demo.component').then(m => m.IntervalDemoComponent)
  },
  {
    path: 'promise-demo',
    loadComponent: () => import('./features/signal-demos/promise-demo.component').then(m => m.PromiseDemoComponent)
  },
  {
    path: '',
    redirectTo: 'lazy-signal',
    pathMatch: 'full'
  }
];
