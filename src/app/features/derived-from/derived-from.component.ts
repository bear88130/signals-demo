import { Component, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { DataService, Todo } from '../../shared/services/data.service';

@Component({
  selector: 'app-derived-from',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatButtonModule, MatProgressBarModule],
  template: `
    <mat-card class="max-w-2xl mx-auto">
      <mat-card-header>
        <mat-card-title>Derived Signal Demo</mat-card-title>
        <mat-card-subtitle>
          展示如何使用 computed 從其他 signal 派生新的 signal
        </mat-card-subtitle>
      </mat-card-header>
      <mat-card-content class="p-4">
        @if (todos()) {
          <div class="space-y-4">
            <!-- 進度條 -->
            <div>
              <p class="mb-2">完成進度：{{ completionPercentage() }}%</p>
              <mat-progress-bar
                [value]="completionPercentage()"
                mode="determinate"
              ></mat-progress-bar>
            </div>

            <!-- 待辦事項列表 -->
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

            <!-- 統計資訊 -->
            <div class="mt-4 p-4 bg-gray-100 rounded">
              <p>總計待辦事項：{{ totalTodos() }}</p>
              <p>已完成事項：{{ completedTodos() }}</p>
              <p>未完成事項：{{ incompleteTodos() }}</p>
            </div>
          </div>
        } @else {
          <p>載入中...</p>
        }
      </mat-card-content>
    </mat-card>
  `
})
export class DerivedFromComponent {
  todos = signal<Todo[]>([]);

  // 派生的 signals
  totalTodos = computed(() => this.todos().length);
  completedTodos = computed(() => this.todos().filter(todo => todo.completed).length);
  incompleteTodos = computed(() => this.totalTodos() - this.completedTodos());
  completionPercentage = computed(() => {
    if (this.totalTodos() === 0) return 0;
    return Math.round((this.completedTodos() / this.totalTodos()) * 100);
  });

  constructor(private dataService: DataService) {
    this.loadTodos();
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
