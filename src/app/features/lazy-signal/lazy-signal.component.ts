import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { DataService, Todo } from '../../shared/services/data.service';
import { toLazySignal } from 'ngxtension/to-lazy-signal';
import { toSignal } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-lazy-signal',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatButtonModule],
  template: `
    <mat-card class="max-w-2xl mx-auto">
      <mat-card-header>
        <mat-card-title>Lazy Signal Demo</mat-card-title>
        <mat-card-subtitle>
          展示如何使用 Signal 延遲載入數據，提高效能
        </mat-card-subtitle>
      </mat-card-header>
      <mat-card-content class="p-4">
        @if (todos()) {
          <div class="space-y-2">
            @for (todo of todos(); track todo.id) {
              <div class="flex items-center gap-2 p-2 border rounded">
                <span [class.line-through]="todo.completed">{{ todo.title }}</span>
                <button mat-button (click)="toggleTodo(todo.id)">
                  {{ todo.completed ? '取消完成' : '標記完成' }}
                </button>
              </div>
            }
          </div>
        } @else {
          <p>載入中...</p>
        }
      </mat-card-content>
    </mat-card>

    <button mat-button (click)="showSignals.set(!showSignals())">
      {{ showSignals() ? '隱藏' : '顯示' }}
    </button>

    <!-- <p>todosWithSignals: {{ todosWithSignals() | json }}</p>
    <p>todosWithLazySignal: {{ todosWithLazySignal() | json }}</p> -->

    @if (showSignals()) {
      <mat-card class="max-w-2xl mx-auto mt-3">
      <mat-card-header>
        <mat-card-title>Lazy Signal Demo</mat-card-title>
        <mat-card-subtitle>
          Lazy Signal 載入
        </mat-card-subtitle>
      </mat-card-header>
      <mat-card-content class="p-4">
        @if (todosWithLazySignal()) {
          <div class="space-y-2">
            @for (todo of todosWithLazySignal(); track todo.id) {
              <div class="flex items-center gap-2 p-2 border rounded">
                <span [class.line-through]="todo.completed">{{ todo.title }}</span>
                <button mat-button (click)="toggleTodo(todo.id)">
                  {{ todo.completed ? '取消完成' : '標記完成' }}
                </button>
              </div>
            }
          </div>
        } @else {
          <p>載入中...</p>
        }
      </mat-card-content>
    </mat-card>

    <mat-card class="max-w-2xl mx-auto mt-3">
      <mat-card-header>
        <mat-card-title>Lazy Signal Demo</mat-card-title>
        <mat-card-subtitle>
          一般 Signal 載入
        </mat-card-subtitle>
      </mat-card-header>
      <mat-card-content class="p-4">
        @if (todosWithSignals()) {
          <div class="space-y-2">
            @for (todo of todosWithSignals(); track todo.id) {
              <div class="flex items-center gap-2 p-2 border rounded">
                <span [class.line-through]="todo.completed">{{ todo.title }}</span>
                <button mat-button (click)="toggleTodo(todo.id)">
                  {{ todo.completed ? '取消完成' : '標記完成' }}
                </button>
              </div>
            }
          </div>
        } @else {
          <p>載入中...</p>
        }
      </mat-card-content>
    </mat-card>
    }
  `
})
export class LazySignalComponent implements OnInit {
  todos = signal<Todo[]>([]);
  showSignals = signal(false);

  private dataService = inject(DataService);
  todosWithSignals = toSignal(this.dataService.getTodosDelay(), {initialValue: []});
  todosWithLazySignal = toLazySignal(this.dataService.getTodosDelay(), {initialValue: []});

  constructor() {
    this.loadTodos();
  }

  ngOnInit(): void {
  }

  private loadTodos(): void {
    this.dataService.getTodos().subscribe(
      todos => this.todos.set(todos)
    );
  }

  toggleTodo(id: number): void {
    this.dataService.toggleTodo(id).subscribe(() => {
      this.loadTodos();
    });
  }
}
