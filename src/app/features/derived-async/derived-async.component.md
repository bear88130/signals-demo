`derivedAsync` is a helper function that allows us to compute a value based on a Promise or Observable, but also supports returning regular values (that are not Promises or Observables). It also gives us the possibility to change the behavior of the computation by choosing the flattening strategy (switch, merge, concat, exhaust) and the initial value of the computed value.\
`derivedAsync` 是一個輔助函數，允許我們根據 Promise 或 Observable 計算一個值，但也支持返回常規值（不是 Promise 或 Observable）。它還給我們提供了通過選擇扁平化策略（切換、合併、連接、耗盡）和計算值的初始值來改變計算行為的可能性。

```
import { derivedAsync } from 'ngxtension/derived-async';
```

Usage使用方式
---------

`derivedAsync` accepts a function that returns a `Promise`, `Observable`, or a regular value, and returns a `Signal` that emits the computed value.\
`derivedAsync` 接受一個返回 `Promise` 、 `Observable` 或常規值的函數，並返回一個發出計算值的 `Signal` 。

### Works with Promises (fetch)\
與承諾（fetch）一起工作

Having a `movieId` signal input, we can use `derivedAsync` to fetch the movie based on the `movieId`. As soon as the `movieId` changes, the previous computation will be cancelled (if it's an API call, it's going to be cancelled too), and a new one will be triggered.\
擁有一個 `movieId` 信號輸入，我們可以使用 `derivedAsync` 根據 `movieId` 獲取電影。當 `movieId` 變更時，之前的計算將被取消（如果是 API 調用，也會被取消），並將觸發一個新的計算。

```
export class MovieCard {  movieId = input.required<string>();
  movie = derivedAsync(() =>    fetch(`https://localhost/api/movies/${this.movieId()}`).then((r) =>      r.json(),    ),  );}
```

### Works with Observables (ex. HttpClient)\
與可觀察對象（例如 HttpClient）一起使用

When we return an `Observable`, it will be automatically subscribed to, and will be unsubscribed when the component is destroyed (or when the computation is re-triggered).\
當我們返回一個 `Observable` 時，它將自動訂閱，並在組件被銷毀（或當計算被重新觸發時）取消訂閱。

In the example below, if the `movieId` changes, the previous computation will be cancelled (if it's an API call, it's going to be cancelled too), and a new one will be triggered.\
在下面的例子中，如果 `movieId` 變更，之前的計算將被取消（如果是 API 調用，也會被取消），並將觸發一個新的計算。

```
import { inject } from '@angular/core';
export class MovieCard {  private http = inject(HttpClient);
  movieId = input.required<string>();
  movie = derivedAsync(() =>    this.http.get<Movie>(`https://localhost/api/movies/${this.movieId()}`),  );}
```

### Works with regular values\
與常規值一起使用

This doesn't bring any benefit over using a regular `computed` signal, but it's possible to return regular values (that are not Promises or Observables) from the callback function.\
這並不帶來使用常規 `computed` 信號的任何好處，但可以從回調函數返回常規值（不是 Promise 或 Observable）。

```
export class MovieCard {  movieId = input.required<string>();  movie = derivedAsync(() => (this.movieId() ? '🍿' : '🎬'));}
```

> Note: The callback function runs in the microtask queue, so it won't emit the value immediately (will return `undefined` by default). If you want to emit the value immediately, you can use the `requireSync` option in the second argument `options` object.\
> 注意：回調函數在微任務隊列中運行，因此不會立即發出值（默認將返回 `undefined` ）。如果您想立即發出值，可以在第二個參數 `options` 對象中使用 `requireSync` 選項。

### Works with `initialValue`與 `initialValue` 合作

If we want to set an initial value for the computed value, we can pass it as the second argument in the `options` object.\
如果我們想為計算值設置初始值，我們可以將其作為第二個參數傳遞到 `options` 對象中。

```
import { injectQueryParams } from 'ngxtension/inject-query-params';
export class UserTasks {  userId = injectQueryParams('userId');
  userTasks = derivedAsync(    () => fetch(`https://localhost/api/tasks?userId=${this.userId()}`),    { initialValue: [] },  );}
```

### Works with `requireSync`與 `requireSync` 合作

If we have an observable that emits the value synchronously, we can use the `requireSync` option to emit the value immediately. This is also useful to fix the type of the signal, so the type won't include `undefined` in the type by default.\
如果我們有一個同步發出值的可觀察對象，我們可以使用 `requireSync` 選項立即發出該值。這對於修正信號的類型也很有用，因此該類型預設不會包含 `undefined` 。

#### Example範例

If you're observable emits the value synchronously, you can use the `requireSync` option to emit the value immediately. This way you don't need the initial value, and the type of the signal will be the type of the observable.\
如果您的可觀察對象同步發出值，您可以使用 `requireSync` 選項立即發出該值。這樣您就不需要初始值，信號的類型將是可觀察對象的類型。

Without `requireSync`, the type of the signal would be `Signal<UserTask[] | undefined>`, but with `requireSync`, the type of the signal will be `Signal<UserTask[]>`.\
沒有 `requireSync` ，信號的類型將是 `Signal<UserTask[] | undefined>` ，但有了 `requireSync` ，信號的類型將是 `Signal<UserTask[]>` 。

```
import { derivedAsync } from 'ngxtension/derived-async';import { startWith } from 'rxjs';
export class UserTasks {  private http = inject(HttpClient);  private tasksService = inject(TasksService);  userId = injectQueryParams('userId');
  data: Signal<UserTask[]> = derivedAsync(    () => this.tasksService.loadUserTasks(userId()).pipe(startWith([])),    { requireSync: true },  );}
```

#### Contextual Observable example\
上下文可觀察的例子

In the example below, we have a `Signal` that represents the state of an API call. We use `derivedAsync` to compute the state of the API call based on the `userId` query parameter.\
在下面的例子中，我們有一個 `Signal` 代表 API 呼叫的狀態。我們使用 `derivedAsync` 根據 `userId` 查詢參數來計算 API 呼叫的狀態。

```
import { derivedAsync } from 'ngxtension/derived-async';
export class UserTasks {  private http = inject(HttpClient);  private tasksService = inject(TasksService);  userId = injectQueryParams('userId');
  data: Signal<ApiCallState<UserTask[]>> = derivedAsync(    () =>      this.tasksService.loadUserTasks(userId()).pipe(        map((res) => ({ status: 'loaded' as const, result: res })),        startWith({ status: 'loading' as const, result: [] }),        catchError((err) => of({ status: 'error' as const, error: err })),      ),    { requireSync: true },  );}
interface ApiCallLoading<TResult> {  status: 'loading';  result: TResult;}interface ApiCallLoaded<TResult> {  status: 'loaded';  result: TResult;}interface ApiCallError<TError> {  status: 'error';  error: TError;}
export type ApiCallState<TResult, TError = string> =  | ApiCallLoading<TResult>  | ApiCallLoaded<TResult>  | ApiCallError<TError>;
```

### Usage outside of injection context\
在注入上下文之外的使用

By default, it needs to be called in an injection context, but it can also be called outside of it by passing the `Injector` in the second argument `options` object.\
默認情況下，它需要在注入上下文中調用，但也可以通過在第二個參數 `options` 對象中傳遞 `Injector` 來在外部調用。

```
import { inject, Injector } from '@angular/core';import { derivedAsync } from 'ngxtension/derived-async';
export class UserTasks {  private injector = inject(Injector);  private userId = injectQueryParams('userId');
  userTasks!: Signal<Task[]>;
  ngOnInit() {    this.userTasks = derivedAsync(      () => fetch(`https://localhost/api/tasks?userId=${this.userId()}`),      { injector: this.injector },    );  }}
```

### Behaviors (switch, merge, concat, exhaust)\
行為（切換、合併、串接、耗盡）

By default, `derivedAsync` uses the `switch` behavior, which means that if the computation is triggered again before the previous one is completed, the previous one will be cancelled. If you want to change the behavior, you can pass the `behavior` option in the second argument `options` object.\
根據預設， `derivedAsync` 使用 `switch` 行為，這意味著如果在前一次計算完成之前再次觸發計算，前一次計算將被取消。如果您想更改行為，可以在第二個參數 `options` 物件中傳遞 `behavior` 選項。

```
export class MovieCard {  movieId = input.required<string>();
  movie = derivedAsync(    () => this.http.get(`https://localhost/api/movies/${this.movieId()}`),    { behavior: 'concat' /* or 'merge', 'concat', 'exhaust' */ },  );}
```

#### switch (default)

If we want to cancel the previous computation, we can use the `switch` behavior, which is the default behavior. If the computation is triggered again before the previous one is completed, the previous one will be cancelled.\
如果我們想要取消之前的計算，我們可以使用 `switch` 行為，這是默認行為。如果在之前的計算完成之前再次觸發計算，之前的計算將被取消。

-   Uses `switchMap` operator使用 `switchMap` 運算符

#### merge合併

If we want to keep the previous computation, we can use the `merge` behavior. If the computation is triggered again before the previous one is completed, the previous one will be kept, and the new one will be started.\
如果我們想保留之前的計算，我們可以使用 `merge` 行為。如果在之前的計算完成之前再次觸發計算，之前的計算將被保留，並且新的計算將開始。

-   Uses `mergeMap` operator使用 `mergeMap` 運算符

#### concat

If we want to keep the previous computation, but also wait for it to complete before starting the new one, we can use the `concat` behavior.\
如果我們想保留之前的計算，但也希望在開始新的計算之前等待它完成，我們可以使用 `concat` 行為。

-   Uses `concatMap` operator使用 `concatMap` 運算符

#### exhaust排氣

If we want to ignore the new computation if the previous one is not completed, we can use the `exhaust` behavior.\
如果我們想忽略新的計算，前一個計算尚未完成，我們可以使用 `exhaust` 行為。

-   Uses `exhaustMap` operator使用 `exhaustMap` 運算符

### Use with previous computed value\
使用先前計算的值

If we want to use the previous computed value in the next computation, we can read it in the callback function as the first argument.\
如果我們想在下一次計算中使用之前計算的值，我們可以在回調函數中將其作為第一個參數讀取。

```
import { injectQueryParams } from 'ngxtension/inject-query-params';
export class UserTasks {  private http = inject(HttpClient);  userId = injectQueryParams('userId');
  userTasks = derivedAsync(    (previousTasks) => {      // Use previousTasks to do something      return this.http.get(        `https://localhost/api/tasks?userId=${this.userId()}`,      );    },    { initialValue: [] },  );}
```

### How to test derivedAsync\
如何測試 derivedAsync

`derivedAsync` is tested heavily, so look at the tests for examples on how to test it. [Github Repo derivedAsync tests](https://github.com/nartc/ngxtension-platform/blob/main/libs/ngxtension/derived-async/src/derived-async.spec.ts)\
`derivedAsync` 被大量測試，因此請查看測試以獲取測試的示例。 Github Repo derivedAsync 測試
