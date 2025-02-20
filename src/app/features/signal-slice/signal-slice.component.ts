import { Component, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { DataService, Todo } from '../../shared/services/data.service';

@Component({
  selector: 'app-signal-slice',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatButtonModule, MatChipsModule],
  template: `
    <mat-card class="max-w-2xl mx-auto">
      <mat-card-header>
        <mat-card-title>Signal Slice Demo</mat-card-title>
        <mat-card-subtitle>
          展示如何使用 computed 對 signal 進行資料切片和過濾操作
        </mat-card-subtitle>
      </mat-card-header>
      <mat-card-content class="p-4">
        <!-- 過濾器 -->
        <div class="mb-4 space-x-2">
          <mat-chip-listbox [multiple]="false" (change)="updateFilter($event)">
            <mat-chip-option [selected]="currentFilter() === 'all'" value="all">
              全部
            </mat-chip-option>
            <mat-chip-option [selected]="currentFilter() === 'active'" value="active">
              進行中
            </mat-chip-option>
            <mat-chip-option [selected]="currentFilter() === 'completed'" value="completed">
              已完成
            </mat-chip-option>
          </mat-chip-listbox>
        </div>

        <!-- 統計資訊 -->
        <div class="mb-4 p-4 bg-gray-100 rounded">
          <p>顯示中項目：{{ filteredTodos().length }} / {{ todos().length }}</p>
        </div>

        <!-- 待辦事項列表 -->
        @if (todos()) {
          <div class="space-y-2">
            @for (todo of filteredTodos(); track todo.id) {
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
export class SignalSliceComponent {
  todos = signal<Todo[]>([]);
  currentFilter = signal<'all' | 'active' | 'completed'>('all');

  // 使用 computed 進行資料切片
  filteredTodos = computed(() => {
    const filter = this.currentFilter();
    const allTodos = this.todos();

    switch (filter) {
      case 'active':
        return allTodos.filter(todo => !todo.completed);
      case 'completed':
        return allTodos.filter(todo => todo.completed);
      default:
        return allTodos;
    }
  });

  constructor(private dataService: DataService) {
    this.loadTodos();
  }

  private loadTodos(): void {
    this.dataService.getTodos().subscribe(
      todos => this.todos.set(todos)
    );
  }

  updateFilter(event: any): void {
    this.currentFilter.set(event.value);
  }

  toggleTodo(id: number): void {
    this.dataService.toggleTodo(id).subscribe(() => {
      this.loadTodos();
    });
  }
}
