import { Component, computed, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatChipsModule } from '@angular/material/chips';
import { DataService, Todo } from '../../shared/services/data.service';
import { derivedAsync } from 'ngxtension/derived-async';
import { of, delay, catchError, map, tap } from 'rxjs';

@Component({
  selector: 'app-derived-async',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatButtonModule, MatProgressSpinnerModule, MatChipsModule],
  template: `
    <mat-card class="max-w-2xl mx-auto">
      <mat-card-header>
        <mat-card-title>Derived Async Signal Demo</mat-card-title>
        <mat-card-subtitle>
          展示如何使用 derivedAsync 處理非同步數據，包含不同的行為模式和錯誤處理
        </mat-card-subtitle>
      </mat-card-header>
      <mat-card-content class="p-4">
        <!-- 行為模式選擇 -->
        <div class="mb-4">
          <mat-chip-listbox [multiple]="false" (change)="updateBehavior($event)">
            <mat-chip-option [selected]="currentBehavior() === 'switch'" value="switch">
              Switch Mode
            </mat-chip-option>
            <mat-chip-option [selected]="currentBehavior() === 'merge'" value="merge">
              Merge Mode
            </mat-chip-option>
            <mat-chip-option [selected]="currentBehavior() === 'concat'" value="concat">
              Concat Mode
            </mat-chip-option>
            <mat-chip-option [selected]="currentBehavior() === 'exhaust'" value="exhaust">
              Exhaust Mode
            </mat-chip-option>
          </mat-chip-listbox>
        </div>

        <!-- 待辦事項列表 -->
        @if (todos(); as todoList) {
          <div class="space-y-2">
            @for (todo of todoList; track todo.id) {
              <div class="flex items-center gap-2 p-2 border rounded">
                <span [class.line-through]="todo.completed">{{ todo.title }}</span>
                <button mat-button (click)="toggleTodo(todo.id)">
                  {{ todo.completed ? '取消完成' : '標記完成' }}
                </button>
                <button mat-button (click)="loadTodoDetails(todo.id)">
                  查看詳情
                </button>
              </div>
            }
          </div>
        } @else {
          <div class="flex justify-center">
            <mat-spinner diameter="30"></mat-spinner>
          </div>
        }

        <!-- 詳細資訊面板 -->
        @if (selectedTodoId()) {
          <div class="mt-4 p-4 border rounded">
            <h3 class="text-lg font-bold mb-2">待辦事項詳情</h3>
            @if (todoDetails(); as details) {
              @if (details) {
                <div>
                  <p>ID: {{ details.id }}</p>
                  <p>標題: {{ details.title }}</p>
                  <p>狀態: {{ details.completed ? '已完成' : '未完成' }}</p>
                </div>
              }
            } @else {
              <div class="flex justify-center">
                <mat-spinner diameter="30"></mat-spinner>
              </div>
            }
          </div>
        }

        <!-- 統計資訊 -->
        <div class="mt-4 p-4 bg-gray-100 rounded">
          <h3 class="text-lg font-bold mb-2">統計資訊</h3>
          <p>總數: {{ stats().total }}</p>
          <p>已完成: {{ stats().completed }}</p>
          <p>完成率: {{ stats().completionRate }}%</p>
        </div>

        <!-- 錯誤顯示 -->
        @if (error()) {
          <div class="mt-4 p-4 bg-red-100 text-red-700 rounded">
            {{ error() }}
          </div>
        }
      </mat-card-content>
    </mat-card>
  `
})
export class DerivedAsyncComponent {
  private dataService = inject(DataService);

  // 基本狀態
  selectedTodoId = signal<number | null>(null);
  currentBehavior = signal<'switch' | 'merge' | 'concat' | 'exhaust'>('switch');
  error = signal<string | null>(null);

  // 使用 derivedAsync 處理待辦事項列表
  // 優勢: 可以封裝非同步的行為，並且提供更好的錯誤處理
  // requiredSync 為 true 確保 Observable 在訂閱時發出一個值
  todos = derivedAsync(
    () => this.dataService.getTodos().pipe(
      catchError(err => {
        this.error.set('載入待辦事項失敗');
        return of([]);
      })
    ),
    { initialValue: [] }
  );

  // 使用 derivedAsync 處理待辦事項詳情，根據選擇的行為模式動態調整
  //   'switch'、'merge'、'concat' 和 'exhaust'，每種模式的作用如下：
  // 1. switch：當新的請求發起時，會取消之前的請求。這意味著如果用戶快速切換待辦事項，只有最後一個請求的結果會被處理。這對於避免不必要的請求非常有用。
  // 2. merge：當新的請求發起時，會保留之前的請求，並同時處理所有請求的結果。這樣可以同時獲取多個請求的結果，但可能會導致多次更新 UI。
  // 3. concat：新的請求會在之前的請求完成後才會開始。這意味著請求會按順序處理，適合需要依賴於前一個請求結果的情況。
  // 4. exhaust：如果之前的請求尚未完成，新的請求將被忽略。這對於避免在請求尚未完成時發起新的請求非常有用。
  todoDetails = derivedAsync<Todo | null>(
    () => {
      const id = this.selectedTodoId();
      if (!id) return of(null);

      return this.dataService.getTodoById(id).pipe(
        delay(2000), // 模擬較長的加載時間
        map(todo => todo || null), // Convert undefined to null
        tap(() => {
          console.log('getTodoById', id);
        }),
        catchError(err => {
          this.error.set('載入詳情失敗');
          return of(null);
        })
      );
    },
    {
      behavior: this.currentBehavior(),
      initialValue: null
    }
  );

  // 使用 derivedAsync 計算統計資訊
  stats = derivedAsync(
    () => {
      const todoList = this.todos();
      const total = todoList.length;
      const completed = todoList.filter(t => t.completed).length;
      const completionRate = total === 0 ? 0 : Math.round((completed / total) * 100);

      return of({ total, completed, completionRate }).pipe(
        delay(500) // 模擬計算延遲
      );
    },
    {
      initialValue: { total: 0, completed: 0, completionRate: 0 },
      requireSync: true // 確保同步返回初始值
    }
  );

  updateBehavior(event: any): void {
    this.currentBehavior.set(event.value);
    this.error.set(null); // 清除可能的錯誤訊息
  }

  loadTodoDetails(id: number): void {
    this.selectedTodoId.set(id);
    this.error.set(null);
  }

  toggleTodo(id: number): void {
    this.dataService.toggleTodo(id).subscribe({
      next: () => {
        // 重新加載待辦事項列表
        this.todos = derivedAsync(
          () => this.dataService.getTodos(),
          { initialValue: this.todos() }
        );

        // 如果正在查看的待辦事項被更新，重新加載詳情
        if (this.selectedTodoId() === id) {
          this.loadTodoDetails(id);
        }
      },
      error: () => {
        this.error.set('更新待辦事項失敗');
      }
    });
  }
}
