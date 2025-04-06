import { ChangeDetectionStrategy, Component, computed, inject, Injector, OnDestroy, signal } from '@angular/core';
import { AsyncPipe, CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { FormsModule } from '@angular/forms';
import { DataService, Todo } from '../../shared/services/data.service';
import { async, concatMap, debounceTime, delay, distinctUntilChanged, filter, from, map, of, Subject, switchMap, takeUntil, tap, toArray } from 'rxjs';
import { toObservableSignal } from 'ngxtension/to-observable-signal';
import { flush } from '@angular/core/testing';
import { toObservable } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-observable-signal',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    FormsModule,
    AsyncPipe
  ],
  // changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
      <button mat-raised-button (click)="toggleIsHidden()">{{isHidden() ? '隱藏' : '顯示'}}</button>

      @if (isHidden()) {
        <mat-card class="max-w-2xl mx-auto">
          <mat-card-header>
            <mat-card-title>Signal to Observable Demo</mat-card-title>
          <mat-card-subtitle>
            展示如何將 Signal 轉換為 Observable
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

      <!-- {{completedTodos | async | json}} -->

      <mat-card class="max-w-2xl mx-auto">
        <mat-card-header>
          <mat-card-title>Signal to Observable Demo</mat-card-title>
          <mat-card-subtitle>
            展示如何將 Signal 轉換為 Observable - pipe 過濾 completed 為 false 的待辦事項
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
          @if (completedTodos | async; as _completedTodos) {
            <div class="space-y-2">
              @for (todo of _completedTodos; track todo.id) {
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
export class ObservableSignalComponent implements OnDestroy {
  isHidden = signal(false);

  todos = toObservableSignal(signal<Todo[]>([]))

  // toArray() 因為一直監聽所以不會完成
  // 取得 completed 為 false 的待辦事項
  completedTodos = this.todos.pipe(
    distinctUntilChanged(),
    delay(3000),
    switchMap(_todos => {
      return of([..._todos.filter(todo => todo.completed === false)])
    }),
  );

  newTodoTitle = '';
  private destroy$ = new Subject<void>();

  constructor(private dataService: DataService) {
    this.loadTodos();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  toggleIsHidden(): void {
    this.isHidden.update(value => !value);
  }

  private loadTodos(): void {
    this.dataService.getTodos()
      .pipe(takeUntil(this.destroy$))
      .subscribe(todos => {
        this.todos.update(() => [...todos])
        console.log(this.todos())
        // 用 async 取得 completedTodos 內容
        console.log(this.completedTodos)
      });
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
