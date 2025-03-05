import {
  Component,
  computed,
  inject,
  Injector,
  OnInit,
  Signal,
  signal,
  WritableSignal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { DataService, Todo } from '../../shared/services/data.service';
import { derivedFrom } from 'ngxtension/derived-from';
import { toSignal } from '@angular/core/rxjs-interop';
import { BehaviorSubject, of, pipe, startWith, switchMap } from 'rxjs';

@Component({
  selector: 'app-derived-from',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatButtonModule, MatProgressBarModule],
  template: `
    <mat-card>
      <mat-card-header>
        <mat-card-title>derivedFrom Demo</mat-card-title>
      </mat-card-header>
      <mat-card-content>
        <div class="demo-section">
          <h3>Todos Status</h3>
          <p>Total Todos: {{ totalTodos() }}</p>
          <p>Completed Todos: {{ completedTodos() }}</p>
          <p>Completion Rate: {{ completionRate() }}%</p>
          <mat-progress-bar
            [value]="completionRate()"
            mode="determinate"
          ></mat-progress-bar>
        </div>

        <div class="demo-section">
          <h3>Todo List</h3>
          @if (isLoading()) {
          <mat-progress-bar mode="indeterminate"></mat-progress-bar>
          } @for (todo of todos(); track todo.id) {
          <div class="todo-item">
            <span [class.completed]="todo.completed">{{ todo.title }}</span>
            <button mat-button (click)="toggleTodo(todo.id)">
              {{ todo.completed ? 'Undo' : 'Complete' }}
            </button>
          </div>
          }
        </div>

        <div class="demo-section">
          <h3>Todos Derived From</h3>
          @if (todosDerivedFrom) {
          {{ todosDerivedFrom() | json }}
          }
        </div>

        <div class="demo-section">
          <button mat-raised-button color="primary" (click)="addNewTodo()">
            Add Random Todo
          </button>
        </div>
      </mat-card-content>
    </mat-card>
  `,
  styles: [
    `
      .demo-section {
        margin: 20px 0;
      }
      .todo-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 8px 0;
        border-bottom: 1px solid #eee;
      }
      .completed {
        text-decoration: line-through;
        color: #888;
      }
    `,
  ],
})
export class DerivedFromComponent implements OnInit {
  private todosSignal: WritableSignal<Todo[]>;
  isLoading = signal(false);
  injector = inject(Injector);

  // Public Signals
  todos: Signal<Todo[]>;
  totalTodos: Signal<number>;
  completedTodos: Signal<number>;
  completionRate: Signal<number>;

  todosDerivedFrom: Signal<Todo[]> | undefined;
  otherDerivedFrom: Signal<number[]> | undefined;

  constructor(private dataService: DataService) {
    this.todosSignal = signal([] as Todo[]);

    // Initialize public signals
    this.todos = computed(() => this.todosSignal());
    this.totalTodos = computed(() => {
      console.log('totalTodos computed called'); // 添加日誌
      const currentTodos = this.todos();
      console.log('todos:', currentTodos); // 日誌當前 todos
      console.log('totalTodos length:', currentTodos.length); // 日誌當前 todos 的長度
      return currentTodos.length;
    });
    this.completedTodos = computed(
      () => this.todos().filter((todo) => todo.completed).length
    );
    this.completionRate = computed(() => {
      const total = this.totalTodos();
      if (total === 0) return 0;
      return Math.round((this.completedTodos() / total) * 100);
    });

    this.todosDerivedFrom = derivedFrom([
      this.dataService.getTodos().pipe(startWith([])),
      this.totalTodos,
      this.completedTodos,
    ]);

    console.log(this.todosDerivedFrom());

    this.otherDerivedFrom = derivedFrom(
      [
        this.dataService.getTodos().pipe(startWith([])),
        this.totalTodos,
        this.completedTodos,
      ],
      pipe(switchMap(() => of([5])))
    );

    console.log(this.otherDerivedFrom());

  }

  ngOnInit(): void {
    this.isLoading.set(true);
    this.dataService.getTodos().subscribe((todos) => {
      this.todosSignal.set(todos);
      this.isLoading.set(false);
    });
  }

  toggleTodo(id: number) {
    this.isLoading.set(true);
    this.dataService.toggleTodo(id).subscribe(() => {
      this.isLoading.set(false);
    });
  }

  addNewTodo() {
    const titles = [
      'Learn RxJS',
      'Practice Angular',
      'Study TypeScript',
      'Build Projects',
      'Write Documentation',
    ];

    const randomTitle = titles[Math.floor(Math.random() * titles.length)];

    this.isLoading.set(true);
    // 深拷貝
    const currentTodos = [...this.todos()];

    this.dataService.addTodo(randomTitle).subscribe((todo) => {
      console.log(this.todos());
      this.todosSignal.set([...currentTodos, todo]);
      if (this.todosDerivedFrom) {
        console.log(this.todosDerivedFrom());
      }
      this.isLoading.set(false);
    });
  }
}
