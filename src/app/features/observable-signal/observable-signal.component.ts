import { Component, OnDestroy, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { FormsModule } from '@angular/forms';
import { DataService, Todo } from '../../shared/services/data.service';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-observable-signal',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    FormsModule
  ],
  template: `
    <mat-card class="max-w-2xl mx-auto">
      <mat-card-header>
        <mat-card-title>Observable to Signal Demo</mat-card-title>
        <mat-card-subtitle>
          展示如何將 Observable 轉換為 signal，並處理非同步數據流
        </mat-card-subtitle>
      </mat-card-header>
      <mat-card-content class="p-4">
        <!-- 新增待辦事項表單 -->
        <div class="mb-4">
          <mat-form-field class="w-full">
            <mat-label>新增待辦事項</mat-label>
            <input matInput [(ngModel)]="newTodoTitle" (keyup.enter)="addTodo()">
          </mat-form-field>
          <button mat-raised-button color="primary" (click)="addTodo()" [disabled]="!newTodoTitle">
            新增
          </button>
        </div>

        <!-- 待辦事項列表 -->
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
  `
})
export class ObservableSignalComponent implements OnDestroy {
  todos = signal<Todo[]>([]);
  newTodoTitle = '';
  private destroy$ = new Subject<void>();

  constructor(private dataService: DataService) {
    this.loadTodos();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadTodos(): void {
    this.dataService.getTodos()
      .pipe(takeUntil(this.destroy$))
      .subscribe(todos => this.todos.set(todos));
  }

  addTodo(): void {
    if (!this.newTodoTitle.trim()) return;

    this.dataService.addTodo(this.newTodoTitle)
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.newTodoTitle = '';
        this.loadTodos();
      });
  }

  toggleTodo(id: number): void {
    this.dataService.toggleTodo(id)
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.loadTodos();
      });
  }
}
