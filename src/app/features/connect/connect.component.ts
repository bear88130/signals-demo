import { Component, OnDestroy, effect, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { FormsModule } from '@angular/forms';
import { DataService, Todo } from '../../shared/services/data.service';
import { Subject, debounceTime, takeUntil } from 'rxjs';

@Component({
  selector: 'app-connect',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatButtonModule, MatSlideToggleModule, FormsModule],
  template: `
    <mat-card class="max-w-2xl mx-auto">
      <mat-card-header>
        <mat-card-title>Connect Signal Demo</mat-card-title>
        <mat-card-subtitle>
          展示如何使用 effect 連接 signal 與組件，實現自動保存功能
        </mat-card-subtitle>
      </mat-card-header>
      <mat-card-content class="p-4">
        <!-- 自動保存開關 -->
        <div class="mb-4 flex items-center gap-2">
          <mat-slide-toggle [(ngModel)]="autoSave" (change)="toggleAutoSave()">
            自動保存
          </mat-slide-toggle>
          @if (saveStatus()) {
            <span class="text-sm text-green-600">{{ saveStatus() }}</span>
          }
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
export class ConnectComponent implements OnDestroy {
  todos = signal<Todo[]>([]);
  autoSave = true;
  saveStatus = signal<string>('');
  private destroy$ = new Subject<void>();
  private todoChanges$ = new Subject<void>();

  constructor(private dataService: DataService) {
    this.loadTodos();
    this.setupAutoSave();

    // 使用 effect 監聽 todos 的變化
    effect(() => {
      const currentTodos = this.todos();
      console.log('Todos updated:', currentTodos);

      if (this.autoSave) {
        this.todoChanges$.next();
      }
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private setupAutoSave(): void {
    this.todoChanges$
      .pipe(
        debounceTime(1000), // 延遲 1 秒後才觸發保存
        takeUntil(this.destroy$)
      )
      .subscribe(() => {
        this.saveStatus.set('儲存中...');
        // 模擬保存到後端的延遲
        setTimeout(() => {
          this.saveStatus.set('已自動儲存');
          setTimeout(() => this.saveStatus.set(''), 2000);
        }, 1000);
      });
  }

  private loadTodos(): void {
    this.dataService.getTodos()
      .pipe(takeUntil(this.destroy$))
      .subscribe(todos => this.todos.set(todos));
  }

  toggleAutoSave(): void {
    if (this.autoSave) {
      this.saveStatus.set('自動儲存已開啟');
    } else {
      this.saveStatus.set('自動儲存已關閉');
    }
    setTimeout(() => this.saveStatus.set(''), 2000);
  }

  toggleTodo(id: number): void {
    this.dataService.toggleTodo(id)
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.loadTodos();
      });
  }
}
