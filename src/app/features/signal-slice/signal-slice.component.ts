import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { DataService, Todo } from '../../shared/services/data.service';
import { signalSlice } from 'ngxtension/signal-slice';
import { Observable, startWith, switchMap } from 'rxjs';

enum STATUS {
  all = 'all',
  active = 'active',
  completed = 'completed',
}

interface TodoState {
  todos: Todo[];
  currentFilter: STATUS;
}

@Component({
  selector: 'app-signal-slice',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatButtonModule, MatChipsModule],
  template: `
    <mat-card class="max-w-2xl mx-auto">
      <mat-card-header>
        <mat-card-title>Signal Slice Demo</mat-card-title>
        <mat-card-subtitle>
          展示如何使用 signalSlice 進行資料切片和過濾操作
        </mat-card-subtitle>
      </mat-card-header>
      <mat-card-content class="p-4">
        <!-- 過濾器 -->
        <div class="mb-4 space-x-2">
          <mat-chip-listbox
            [multiple]="false"
            (change)="state.updateFilter($event.value)"
          >
            <mat-chip-option
              [selected]="state.currentFilter() === 'all'"
              value="all"
            >
              全部
            </mat-chip-option>
            <mat-chip-option
              [selected]="state.currentFilter() === 'active'"
              value="active"
            >
              進行中
            </mat-chip-option>
            <mat-chip-option
              [selected]="state.currentFilter() === 'completed'"
              value="completed"
            >
              已完成
            </mat-chip-option>
          </mat-chip-listbox>
        </div>

        <!-- 統計資訊 -->
        <div class="mb-4 p-4 bg-gray-100 rounded">
          <p>
            顯示中項目：{{ state.filteredTodos().length }} / {{ state.todos().length }}
          </p>
        </div>

        <!-- 待辦事項列表 -->
        @if (state.todos()) {
        <div class="space-y-2">
          @for (todo of state.filteredTodos(); track todo.id) {
          <div class="flex items-center gap-2 p-2 border rounded">
            <span [class.line-through]="todo.completed">{{ todo.title }}</span>
            <button mat-button (click)="state.toggleTodo(todo.id)">
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
  `,
})
export class SignalSliceComponent {
  state;

  private initialState: TodoState = {
    todos: [],
    currentFilter: STATUS.all,
  };

  constructor(private dataService: DataService) {

    this.state = signalSlice({
      // Signal Slice 的初始狀態
      // 這裡的 initialState 是一個物件，包含 todos 和 currentFilter 屬性
      initialState: this.initialState,
      // 資料取得來源
      // 這裡的 sources 是一個陣列，包含一個 Observable，這個 Observable 會在組件初始化時載入 todos
      sources: [
        // Load todos from service
        this.dataService.getTodos().pipe(
          startWith([]),
          switchMap((todos) => [{ todos, currentFilter: STATUS.active }])
        ),
      ],
      // 狀態變更方法
      actionSources: {
        // Update filter action
        updateFilter: (
          state,
          action$: Observable<STATUS>
        ) =>
          action$.pipe(
            switchMap((filter) => [
              {
                currentFilter: filter,
              },
            ])
          ),
        // Toggle todo action
        toggleTodo: (state, action$: Observable<number>) => {
          return action$.pipe(
            switchMap((id) => this.dataService.toggleTodo(id)),
            switchMap(() => this.dataService.getTodos()),
            switchMap((todos) => [{ todos }])
          );
        },
      },
      // 用於取得資料
      selectors: (state) => ({
        filteredTodos: () => {
          const filter = state().currentFilter;
          const todos = state().todos;

          switch (filter) {
            case 'active':
              return todos.filter((todo) => !todo.completed);
            case 'completed':
              return todos.filter((todo) => todo.completed);
            default:
              return todos;
          }
        },
      }),
    });
  }
}
