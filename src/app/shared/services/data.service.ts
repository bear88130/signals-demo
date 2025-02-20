import { Injectable, Signal, WritableSignal } from '@angular/core';
import { Observable, delay, of } from 'rxjs';
import { toSignal, toObservable } from '@angular/core/rxjs-interop';
import { toLazySignal } from 'ngxtension/to-lazy-signal';

export interface Todo {
  id: number;
  title: string;
  completed: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class DataService {
  private todos: Todo[] = [
    { id: 1, title: 'Learn Angular Signals', completed: false },
    { id: 2, title: 'Master ngxtension', completed: false },
    { id: 3, title: 'Build a demo app', completed: true },
  ];

  getTodos(): Observable<Todo[]> {
    return of(this.todos).pipe(delay(800)); // 模擬 API 延遲
  }

  getTodosDelay(): Observable<Todo[]> {
    return of(this.todos).pipe(delay(2000)); // 模擬 API 延遲
  }

  getTodoById(id: number): Observable<Todo | undefined> {
    return of(this.todos.find(todo => todo.id === id)).pipe(delay(500));
  }

  addTodo(title: string): Observable<Todo> {
    const newTodo: Todo = {
      id: this.todos.length + 1,
      title,
      completed: false
    };
    this.todos.push(newTodo);
    return of(newTodo).pipe(delay(500));
  }

  toggleTodo(id: number): Observable<Todo | undefined> {
    const todo = this.todos.find(t => t.id === id);
    if (todo) {
      todo.completed = !todo.completed;
    }
    return of(todo).pipe(delay(500));
  }
}
