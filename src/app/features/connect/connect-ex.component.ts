import { Component, computed, effect, inject, Injector, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { FormsModule } from '@angular/forms';
import { DataService, Todo } from '../../shared/services/data.service';
import { Subject, debounceTime } from 'rxjs';
import { connect } from 'ngxtension/connect';

@Component({
  selector: 'app-connect-ex',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatButtonModule, MatSlideToggleModule, FormsModule],
  template: `
    <div>
      <p>state: {{ state() | json }}</p>
      <p>First Name: {{ firstName() }}</p>
      <p>Last Name: {{ lastName() }}</p>

      <div>
        <input #lastNameInput type="text" placeholder="Enter last name">
        <button (click)="submitLastName(lastNameInput.value)">Update Last Name</button>
      </div>
    </div>
  `
})
export class ConnectExComponent implements OnInit {
  private injector = inject(Injector);

  state = signal({
    user: {
      firstName: 'chau',
      lastName: 'tran',
    },
  });

  firstName = computed(() => this.state().user.firstName);
  lastName = computed(() => this.state().user.lastName);

  lastName$ = new Subject<string>();

  submitLastName(value: string) {
    this.lastName$.next(value);
  }

  constructor() {
    // we want to connect `lastName$` stream to `state`
    // and when `lastName$` emits, update the state with the `reducer` fn
    connect(this.state, this.lastName$, (prev, lastName) => ({
      user: { ...prev.user, lastName },
    }));

    effect(() => {
      console.log('first name changed', this.firstName());
    });

    // logs: first name changed, chau

    this.lastName$.next('Tran');

    // `firstName()` effect won't be triggered because we only update `lastName`
  }

  ngOnInit() {
    // connect(this.state, this.lastName$, (prev, lastName) => ({
    //   user: { ...prev.user, lastName },
    // }));

    // connect(this.state, this.lastName$, (prev, lastName) => ({
    //   user: { ...prev.user, lastName },
    // }), this.injector);
  }
}
