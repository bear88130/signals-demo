import { Component, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { DataService, Todo } from '../../shared/services/data.service';

@Component({
  selector: 'app-derived-async',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatButtonModule, MatProgressSpinnerModule],
  template: `
    <mat-card class="max-w-2xl mx-auto">
      <mat-card-header>
        <mat-card-title>Derived Async Signal Demo</mat-card-title>
        <mat-card-subtitle>
          展示如何使用 computed 處理非同步數據，並派生新的 signal
        </mat-card-subtitle>
      </mat-card-header>
      <mat-card-content class="p-4">
        <!-- 待辦事項列表 -->
        @if (todos()) {
          <div class="space-y-2">
            @for (todo of todos(); track todo.id) {
              <div class="flex items-center gap-2 p-2 border rounded">
                <span [class.line-through]="todo.completed">{{ todo.title }}</span>
                <button mat-button (click)="toggleTodo(todo.id)">
                  {{ todo.completed ? '取消完成' : '標記完成' }}
                </button>
                <!-- 顯示詳細資訊按鈕 -->
                <button mat-button (click)="loadTodoDetails(todo.id)">
                  查看詳情
                </button>
              </div>
            }
          </div>
        } @else {
          <p>載入中...</p>
        }

        <!-- 詳細資訊面板 -->
        @if (selectedTodoId()) {
          <div class="mt-4 p-4 border rounded">
            <h3 class="text-lg font-bold mb-2">待辦事項詳情</h3>
            @if (selectedTodoDetails()) {
              <div>
                <p>ID: {{ selectedTodoDetails()?.id }}</p>
                <p>標題: {{ selectedTodoDetails()?.title }}</p>
                <p>狀態: {{ selectedTodoDetails()?.completed ? '已完成' : '未完成' }}</p>
              </div>
            } @else {
              <div class="flex justify-center">
                <mat-spinner diameter="30"></mat-spinner>
              </div>
            }
          </div>
        }
      </mat-card-content>
    </mat-card>
  `
})
export class DerivedAsyncComponent {
  todos = signal<Todo[]>([]);
  selectedTodoId = signal<number | null>(null);
  selectedTodoDetails = signal<Todo | null>(null);

  constructor(private dataService: DataService) {
    this.loadTodos();
  }

  private loadTodos(): void {
    this.dataService.getTodos().subscribe(
      todos => this.todos.set(todos)
    );
  }

  loadTodoDetails(id: number): void {
    this.selectedTodoId.set(id);
    this.selectedTodoDetails.set(null); // 重置詳情，顯示載入狀態

    this.dataService.getTodoById(id).subscribe(
      todo => this.selectedTodoDetails.set(todo || null)
    );
  }

  toggleTodo(id: number): void {
    this.dataService.toggleTodo(id).subscribe(() => {
      this.loadTodos();
      // 如果正在查看的待辦事項被更新，也更新詳情
      if (this.selectedTodoId() === id) {
        this.loadTodoDetails(id);
      }
    });
  }
}
