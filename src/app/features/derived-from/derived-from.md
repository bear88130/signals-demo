`derivedFrom` is a helper function that combines the values of `Observable`s or `Signal`s and emits the combined value. It also gives us the possibility to change the combined value before emitting it using rxjs operators.\
`derivedFrom` 是一個輔助函數，將 `Observable` 或 `Signal` 的值結合並發出結合的值。它還使我們能夠在發出之前使用 rxjs 操作符更改結合的值。

It is similar to `combineLatest`, but it also takes `Signals` into consideration.\
它類似於 `combineLatest` ，但也考慮了 `Signals` 。

```
import { derivedFrom } from 'ngxtension/derived-from';
```

Inside story of the function功能的內幕故事

Read more here: [A sweet spot between signals and observables 🍬](https://itnext.io/a-sweet-spot-between-signals-and-observables-a3c9620768f1)\
在這裡閱讀更多：信號與可觀察量之間的甜蜜點 🍬

Usage使用方式
---------

`derivedFrom` accepts an array or object of `Observable`s or `Signal`s and returns a `Signal` that emits the combined value of the `Observable`s or `Signal`s. By default, it needs to be called in an injection context, but it can also be called outside of it by passing the `Injector` in the third argument `options` object. If your Observable doesn't emit synchronously, you can use the `startWith` operator to change the starting value, or pass an `initialValue` in the third argument `options` object.\
`derivedFrom` 接受一個 `Observable` 或 `Signal` 的陣列或物件，並返回一個 `Signal` ，該 `Signal` 會發出 `Observable` 或 `Signal` 的組合值。默認情況下，它需要在注入上下文中調用，但也可以通過在第三個參數 `options` 物件中傳遞 `Injector` 來在外部調用。如果您的 Observable 不會同步發出，您可以使用 `startWith` 操作符來更改起始值，或在第三個參數 `options` 物件中傳遞 `initialValue` 。

```
const a = signal(1);const b$ = new BehaviorSubject(2);
// array typeconst combined = derivedFrom([a, b$]);console.log(combined()); // [1, 2]
// object typeconst combined = derivedFrom({ a, b: b$ });console.log(combined()); // { a: 1, b: 2 }
```

It can be used in multiple ways:\
它可以以多種方式使用：

1.  Combine multiple `Signal`s合併多個 `Signal`
2.  Combine multiple `Observable`s合併多個 `Observable`
3.  Combine multiple `Signal`s and `Observable`s\
    結合多個 `Signal` 和 `Observable`
4.  Using initialValue param\
    使用 initialValue 參數
5.  Use it outside of an injection context\
    在注入上下文之外使用它

### 1\. Combine multiple `Signal`s\
1\. 組合多個 `Signal`

We can use `derivedFrom` to combine multiple `Signal`s into one `Signal`, which will emit the combined value of the `Signal`s.\
我們可以使用 `derivedFrom` 將多個 `Signal` 合併成一個 `Signal` ，這將發出 `Signal` 的合併值。

```
const page = signal(1);const filters = signal({ name: 'John' });
const combined = derivedFrom([page, filters]);
console.log(combined()); // [1, { name: 'John' }]
```

At this point we still don't get any benefit from using `derivedFrom` because we can already combine multiple `Signal`s using `computed` function. But, what's better is that `derivedFrom` allows us to change the combined value before emitting it using rxjs operators (applying asynchronous operations), which is not possible with `computed`.\
在這個時候，我們仍然無法從使用 `derivedFrom` 中獲得任何好處，因為我們已經可以使用 `computed` 函數來組合多個 `Signal` 。但更好的是， `derivedFrom` 允許我們在使用 rxjs 操作符（應用異步操作）發出之前更改組合值，這在 `computed` 中是無法做到的。

```
import { derivedFrom } from 'ngxtension/derived-from';import { delay, of, pipe, switchMap } from 'rxjs';
let a = signal(1);let b = signal(2);
let c = derivedFrom(  [a, b],  pipe(    switchMap(      ([a, b]) =>        // of(a + b) is supposed to be an asynchronous operation (e.g. http request)        of(a + b).pipe(delay(1000)), // delay the emission of the combined value by 1 second for demonstration purposes    ),  ),);
effect(() => console.log(c())); // 👈 will throw an error!! 💥
setTimeout(() => {  a.set(3);}, 3000);
// You can copy the above example inside an Angular constructor and see the result in the console.
```

This will *throw an error* because the operation pipeline will produce an observable that will **not have a sync value** because they emit their values later on, so the resulting `c` signal doesn't have an initial value, and this causes the error.\
這將引發錯誤，因為操作管道將產生一個可觀察對象，該對象不會有同步值，因為它們稍後才會發出其值，因此結果 `c` 信號沒有初始值，這導致了錯誤。

You can solve this by using the `initialValue` param in the third argument `options` object, to define the starting value of the resulting Signal and *prevent throwing an error* in case of *real async* observable.\
您可以通過在第三個參數 `options` 物件中使用 `initialValue` 參數來解決此問題，以定義結果信號的起始值，並防止在實際的異步可觀察對象中引發錯誤。

```
let c = derivedFrom(  [a, b],  pipe(    switchMap(      ([a, b]) => of(a + b).pipe(delay(1000)), // later async emit value    ),  ),  { initialValue: 42 }, // 👈 pass the initial value of the resulting signal);
```

This works, and you can copy the above example inside a component constructor and see the result in the console:\
這樣可以，你可以將上述範例複製到組件構造函數中，並在控制台中查看結果：

```
42 - // initial value passed as third argument  3 - // combined value after 1 second  5; // combined value after 3 seconds
```

Another way to solve this problem is using the `startWith` rxjs operator in the pipe to force the observable to have a starting value like below.\
解決此問題的另一種方法是使用 `startWith` rxjs 操作符在管道中強制可觀察對象具有如下的起始值。

```
let c = derivedFrom(  [a, b],  pipe(    switchMap(([a, b]) => of(a + b).pipe(delay(1000))),    startWith(0), // 👈 change the starting value (emits synchronously)  ),);
```

The console log will be:\
控制台日誌將是：

```
0 - // starting value (initial sync emit)  3 - // combined value after 1 second  5; // combined value after 3 seconds
```

### 2\. Combine multiple `Observable`s\
2\. 組合多個 `Observable`

We can use `derivedFrom` to combine multiple `Observable`s into one `Signal`, which will emit the combined value of the `Observable`s.\
我們可以使用 `derivedFrom` 將多個 `Observable` 合併成一個 `Signal` ，這將發出 `Observable` 的合併值。

```
const page$ = new BehaviorSubject(1);const filters$ = new BehaviorSubject({ name: 'John' });
const combined = derivedFrom([page$, filters$]);
console.log(combined()); // [1, { name: 'John' }]
```

This is just a better version of:\
這只是更好的版本：

```
const combined = toSignal(combineLatest([page$, filters$]));
```

And it can be used in the same way as in the previous example with rxjs operators.\
它可以像前一個例子中使用 rxjs 操作符一樣使用。

### 3\. Combine multiple `Signal`s and `Observable`s\
3\. 結合多個 `Signal` 和 `Observable`

This is where `derivedFrom` shines. We can use it to combine multiple `Signal`s and `Observable`s into one `Signal`.\
這是 `derivedFrom` 發光的地方。我們可以用它將多個 `Signal` 和 `Observable` 合併成一個 `Signal` 。

```
const page = signal(1);const filters$ = new BehaviorSubject({ name: 'John' });
const combined = derivedFrom([page, filters$]);console.log(combined()); // [1, { name: 'John' }]
// or using the object notationconst combinedObject = derivedFrom({ page, filters: filters$ });console.log(combinedObject()); // { page: 1, filters: { name: 'John' } }
```

Tricky part棘手的部分

For `Observable`s that don't emit synchronously `derivedFrom` will **throw an error** forcing you to fix this situation either by passing an `initialValue` in the third argument, or using `startWith` operator to force observable to have a sync starting value.\
對於不同步發出的 `Observable` s， `derivedFrom` 將拋出錯誤，迫使您通過在第三個參數中傳遞 `initialValue` 或使用 `startWith` 運算符來強制可觀察對象具有同步起始值來修復此情況。

```
const page$ = new Subject<number>(); // Subject doesn't have an initial valueconst filters$ = new BehaviorSubject({ name: 'John' });const combined = derivedFrom([page$, filters$]); // 👈 will throw an error!! 💥
```

But, we can always use the `startWith` operator to change the initial value.\
但是，我們總是可以使用 `startWith` 運算符來更改初始值。

```
const combined = derivedFrom([  page$.pipe(startWith(0)), // change the initial value to 0  filters$,]);
console.log(combined()); // [0, { name: 'John' }]
```

### 4\. Using initialValue param\
4\. 使用 initialValue 參數

Or you can pass `initialValue` to `derivedFrom` in the third argument `options` object, to define the starting value of the resulting Signal and **prevent throwing error** in case of observables that emit later.\
或者您可以在第三個參數 `options` 物件中傳遞 `initialValue` 到 `derivedFrom` ，以定義結果信號的起始值，並防止在稍後發出可觀察對象時引發錯誤。

```
const combined = derivedFrom(  [page$, filters$],  switchMap(([page, filters]) => this.dataService.getArrInfo$(page, filters)),  { initialValue: [] as Info[] }, // define the initial value of resulting signal); // inferred ad Signal<Info[]>
```

### 5\. Use it outside of an injection context\
5\. 在非注入上下文中使用它

By default, `derivedFrom` needs to be called in an injection context, but it can also be called outside of it by passing the `Injector` in the third argument `options` object.\
根據預設， `derivedFrom` 需要在注入上下文中被調用，但也可以通過在第三個參數 `options` 物件中傳遞 `Injector` 來在外部調用。

```
@Component()export class MyComponent {  private readonly injector = inject(Injector);  private readonly dataService = inject(DataService);
  // we can read the userId inside ngOnInit and not in the constructor  @Input() userId!: number;
  data!: Signal<string[]>;
  ngOnInit() {    // not an injection context    const page = signal(1);    const filters$ = new BehaviorSubject({ name: 'John' });
    this.data = derivedFrom(      [page, filters$],      pipe(        switchMap(([page, filters]) =>          this.dataService.getUserData(this.userId, page, filters),        ),        startWith([] as string[]), // change the initial value      ),      { injector: this.injector }, // 👈 pass the injector in the options object    );  }}
```
