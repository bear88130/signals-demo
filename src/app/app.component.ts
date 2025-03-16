import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterModule, MatSidenavModule, MatListModule, MatToolbarModule, MatIconModule],
  template: `
    <mat-sidenav-container class="h-screen">
      <mat-sidenav #sidenav mode="side" opened class="w-64 p-4">
        <div class="text-xl font-bold mb-4">Signals Demo</div>
        <mat-nav-list>
          <a mat-list-item routerLink="/signal">Signal Demo</a>
          <a mat-list-item routerLink="/lazy-signal">toLazySignal Demo</a>
          <a mat-list-item routerLink="/derived-from">derivedFrom Demo</a>
          <a mat-list-item routerLink="/observable-signal">toObservableSignal Demo</a>
          <a mat-list-item routerLink="/derived-async">derivedAsync Demo</a>
          <a mat-list-item routerLink="/connect">connect Demo</a>
          <a mat-list-item routerLink="/connect-ex">connect ex Demo</a>
          <a mat-list-item routerLink="/signal-slice">signalSlice Demo</a>
          <a mat-list-item routerLink="/linked-signal">linkedSignal Demo</a>
          <a mat-list-item routerLink="/timeout-demo">timeout Demo</a>
          <a mat-list-item routerLink="/interval-demo">interval Demo</a>
          <a mat-list-item routerLink="/promise-demo">promise Demo</a>
        </mat-nav-list>
      </mat-sidenav>
      <mat-sidenav-content class="p-4">
        <router-outlet></router-outlet>
      </mat-sidenav-content>
    </mat-sidenav-container>
  `,
})
export class AppComponent {
  title = 'signals-demo';
}
