# siganl 官網資料
[What are signals?\
信號是什麼？](https://angular.dev/guide/signals#what-are-signals)
-------------------------------------------------------------------------------

A **signal** is a wrapper around a value that notifies interested consumers when that value changes. Signals can contain any value, from primitives to complex data structures.\
信號是一個包裝器，用於包裹一個值，當該值發生變化時，會通知感興趣的消費者。信號可以包含任何值，從基本類型到複雜的數據結構。

You read a signal's value by calling its getter function, which allows Angular to track where the signal is used.\
您可以通過調用其獲取器函數來讀取信號的值，這使得 Angular 能夠跟踪信號的使用位置。

Signals may be either *writable* or *read-only*.\
信號可以是可寫的或只讀的。

### [Writable signals可寫信號](https://angular.dev/guide/signals#writable-signals)

Writable signals provide an API for updating their values directly. You create writable signals by calling the `signal` function with the signal's initial value:\
可寫信號提供了一個直接更新其值的 API。您可以通過調用 `signal` 函數並傳入信號的初始值來創建可寫信號：

```
const count = signal(0);// Signals are getter functions - calling them reads their value.console.log('The count is: ' + count());
```

check

To change the value of a writable signal, either `.set()` it directly:\
要直接更改可寫信號的值，請 `.set()` 它：

```
count.set(3);
```

check

or use the `.update()` operation to compute a new value from the previous one:\
或使用 `.update()` 操作從前一個值計算新值：

```
// Increment the count by 1.count.update(value => value + 1);
```

check

Writable signals have the type `WritableSignal`.\
可寫信號的類型為 `WritableSignal` 。

### [Computed signals計算信號](https://angular.dev/guide/signals#computed-signals)

**Computed signal** are read-only signals that derive their value from other signals. You define computed signals using the `computed` function and specifying a derivation:\
計算信號是只讀信號，其值來自其他信號。您可以使用 `computed` 函數定義計算信號並指定衍生：

```
const count: WritableSignal<number> = signal(0);const doubleCount: Signal<number> = computed(() => count() * 2);
```

check

The `doubleCount` signal depends on the `count` signal. Whenever `count` updates, Angular knows that `doubleCount` needs to update as well.\
`doubleCount` 信號依賴於 `count` 信號。每當 `count` 更新時，Angular 知道 `doubleCount` 也需要更新。

#### [Computed signals are both lazily evaluated and memoized\
計算信號是延遲評估和記憶化的](https://angular.dev/guide/signals#computed-signals-are-both-lazily-evaluated-and-memoized)

`doubleCount`'s derivation function does not run to calculate its value until the first time you read `doubleCount`. The calculated value is then cached, and if you read `doubleCount` again, it will return the cached value without recalculating.\
`doubleCount` 的衍生函數在您第一次讀取 `doubleCount` 之前不會運行以計算其值。計算出的值會被緩存，如果您再次讀取 `doubleCount` ，它將返回緩存的值而不重新計算。

If you then change `count`, Angular knows that `doubleCount`'s cached value is no longer valid, and the next time you read `doubleCount` its new value will be calculated.\
如果您然後更改 `count` ，Angular 知道 `doubleCount` 的快取值不再有效，下次您讀取 `doubleCount` 時，其新值將被計算。

As a result, you can safely perform computationally expensive derivations in computed signals, such as filtering arrays.\
因此，您可以安全地在計算信號中執行計算成本高昂的推導，例如過濾數組。

#### [Computed signals are not writable signals\
計算信號不是可寫信號](https://angular.dev/guide/signals#computed-signals-are-not-writable-signals)

You cannot directly assign values to a computed signal. That is,\
您不能直接將值分配給計算信號。也就是說，

```
doubleCount.set(3);
```

check

produces a compilation error, because `doubleCount` is not a `WritableSignal`.\
產生編譯錯誤，因為 `doubleCount` 不是 `WritableSignal` 。

#### [Computed signal dependencies are dynamic\
計算的信號依賴性是動態的](https://angular.dev/guide/signals#computed-signal-dependencies-are-dynamic)

Only the signals actually read during the derivation are tracked. For example, in this `computed` the `count` signal is only read if the `showCount` signal is true:\
只有在推導過程中實際讀取的信號會被追蹤。例如，在這個 `computed` 中，只有當 `showCount` 信號為真時， `count` 信號才會被讀取：

```
const showCount = signal(false);const count = signal(0);const conditionalCount = computed(() => {  if (showCount()) {    return `The count is ${count()}.`;  } else {    return 'Nothing to see here!';  }});
```

check

When you read `conditionalCount`, if `showCount` is `false` the "Nothing to see here!" message is returned *without* reading the `count` signal. This means that if you later update `count` it will *not* result in a recomputation of `conditionalCount`.\
當你閱讀 `conditionalCount` 時，如果 `showCount` 是 `false` ，則會返回「這裡沒有任何東西可看！」的訊息，而不會讀取 `count` 信號。這意味著如果你稍後更新 `count` ，則不會導致 `conditionalCount` 的重新計算。

If you set `showCount` to `true` and then read `conditionalCount` again, the derivation will re-execute and take the branch where `showCount` is `true`, returning the message which shows the value of `count`. Changing `count` will then invalidate `conditionalCount`'s cached value.\
如果您將 `showCount` 設置為 `true` ，然後再次讀取 `conditionalCount` ，則推導將重新執行並採取 `showCount` 為 `true` 的分支，返回顯示 `count` 值的消息。更改 `count` 將使 `conditionalCount` 的緩存值失效。

Note that dependencies can be removed during a derivation as well as added. If you later set `showCount` back to `false`, then `count` will no longer be considered a dependency of `conditionalCount`.\
請注意，依賴項可以在推導過程中被移除，也可以被添加。如果您稍後將 `showCount` 設回 `false` ，則 `count` 將不再被視為 `conditionalCount` 的依賴項。

[Reading signals in `OnPush` components\
在 `OnPush` 元件中讀取信號](https://angular.dev/guide/signals#reading-signals-in-onpush-components)
------------------------------------------------------------------------------------------------------------------------------------

When you read a signal within an `OnPush` component's template, Angular tracks the signal as a dependency of that component. When the value of that signal changes, Angular automatically [marks](https://angular.dev/api/core/ChangeDetectorRef#markforcheck) the component to ensure it gets updated the next time change detection runs. Refer to the [Skipping component subtrees](https://angular.dev/best-practices/skipping-subtrees) guide for more information about `OnPush` components.\
當您在 `OnPush` 組件的模板中讀取信號時，Angular 將該信號視為該組件的依賴項。當該信號的值發生變化時，Angular 會自動標記該組件，以確保在下一次變更檢測運行時進行更新。請參閱跳過組件子樹指南以獲取有關 `OnPush` 組件的更多信息。

[Effects效果](https://angular.dev/guide/signals#effects)
------------------------------------------------------

Signals are useful because they notify interested consumers when they change. An **effect** is an operation that runs whenever one or more signal values change. You can create an effect with the `effect` function:\
信號是有用的，因為它們在變化時會通知感興趣的消費者。效果是一種操作，當一個或多個信號值改變時會運行。您可以使用 `effect` 函數創建效果：

```
effect(() => {  console.log(`The current count is: ${count()}`);});
```

check

Effects always run **at least once.** When an effect runs, it tracks any signal value reads. Whenever any of these signal values change, the effect runs again. Similar to computed signals, effects keep track of their dependencies dynamically, and only track signals which were read in the most recent execution.\
效果總是至少執行一次。當效果執行時，它會追蹤任何信號值的讀取。每當這些信號值中的任何一個發生變化時，效果會再次執行。類似於計算信號，效果動態地追蹤其依賴項，並且僅追蹤在最近一次執行中被讀取的信號。

Effects always execute **asynchronously**, during the change detection process.\
效果總是異步執行，在變更檢測過程中。

### [Use cases for effects\
效果的使用案例](https://angular.dev/guide/signals#use-cases-for-effects)

Effects are rarely needed in most application code, but may be useful in specific circumstances. Here are some examples of situations where an `effect` might be a good solution:\
在大多數應用程式代碼中，效果很少需要，但在特定情況下可能會有用。以下是一些情況的例子，其中 `effect` 可能是一個好的解決方案：

-   Logging data being displayed and when it changes, either for analytics or as a debugging tool.\
    顯示日誌數據及其變更時，無論是用於分析還是作為調試工具。
-   Keeping data in sync with `window.localStorage`.\
    保持與 `window.localStorage` 的數據同步。
-   Adding custom DOM behavior that can't be expressed with template syntax.\
    添加無法用模板語法表達的自定義 DOM 行為。
-   Performing custom rendering to a `<canvas>`, charting library, or other third party UI library.\
    對 `<canvas>` 、圖表庫或其他第三方 UI 庫進行自定義渲染。

### When not to use effects\
何時不應使用效果

Avoid using effects for propagation of state changes. This can result in `ExpressionChangedAfterItHasBeenChecked` errors, infinite circular updates, or unnecessary change detection cycles.\
避免使用效果來傳播狀態變更。這可能導致 `ExpressionChangedAfterItHasBeenChecked` 錯誤、無限循環更新或不必要的變更檢測週期。

Instead, use `computed` signals to model state that depends on other state.\
相反，使用 `computed` 信號來建模依賴於其他狀態的狀態。

### [Injection context注入上下文](https://angular.dev/guide/signals#injection-context)

By default, you can only create an `effect()` within an [injection context](https://angular.dev/guide/di/dependency-injection-context) (where you have access to the `inject` function). The easiest way to satisfy this requirement is to call `effect` within a component, directive, or service `constructor`:\
默認情況下，您只能在注入上下文中創建 `effect()` （在這裡您可以訪問 `inject` 函數）。滿足此要求的最簡單方法是在組件、指令或服務 `constructor` 中調用 `effect` ：

```
@Component({...})export class EffectiveCounterComponent {  readonly count = signal(0);  constructor() {    // Register a new effect.    effect(() => {      console.log(`The count is: ${this.count()}`);    });  }}
```

check

Alternatively, you can assign the effect to a field (which also gives it a descriptive name).\
另外，您可以將效果分配給一個字段（這也給它一個描述性的名稱）。

```
@Component({...})export class EffectiveCounterComponent {  readonly count = signal(0);  private loggingEffect = effect(() => {    console.log(`The count is: ${this.count()}`);  });}
```

check

To create an effect outside the constructor, you can pass an `Injector` to `effect` via its options:\
要在建構函數外創建效果，您可以通過其選項將 `Injector` 傳遞給 `effect` ：

```
@Component({...})export class EffectiveCounterComponent {  readonly count = signal(0);  constructor(private injector: Injector) {}  initializeLogging(): void {    effect(() => {      console.log(`The count is: ${this.count()}`);    }, {injector: this.injector});  }}
```

check

### [Destroying effects摧毀效果](https://angular.dev/guide/signals#destroying-effects)

When you create an effect, it is automatically destroyed when its enclosing context is destroyed. This means that effects created within components are destroyed when the component is destroyed. The same goes for effects within directives, services, etc.\
當您創建一個效果時，當其封閉的上下文被銷毀時，它會自動被銷毀。這意味著在組件內創建的效果會在組件被銷毀時被銷毀。指令、服務等內的效果也是如此。

Effects return an `EffectRef` that you can use to destroy them manually, by calling the `.destroy()` method. You can combine this with the `manualCleanup` option to create an effect that lasts until it is manually destroyed. Be careful to actually clean up such effects when they're no longer required.\
效果返回一個 `EffectRef` ，您可以通過調用 `.destroy()` 方法手動銷毀它們。您可以將此與 `manualCleanup` 選項結合使用，以創建一個持續到手動銷毀的效果。當這些效果不再需要時，請小心實際清理它們。

[Advanced topics進階主題](https://angular.dev/guide/signals#advanced-topics)
------------------------------------------------------------------------

### [Signal equality functions\
信號相等函數](https://angular.dev/guide/signals#signal-equality-functions)

When creating a signal, you can optionally provide an equality function, which will be used to check whether the new value is actually different than the previous one.\
在創建信號時，您可以選擇性地提供一個相等函數，該函數將用於檢查新值是否實際上與先前的值不同。

```
import _ from 'lodash';const data = signal(['test'], {equal: _.isEqual});// Even though this is a different array instance, the deep equality// function will consider the values to be equal, and the signal won't// trigger any updates.data.set(['test']);
```

check

Equality functions can be provided to both writable and computed signals.\
可以為可寫信號和計算信號提供相等函數。

**HELPFUL:** By default, signals use referential equality ([`Object.is()`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object/is) comparison).\
有用：根據預設，信號使用參考相等性（ `Object.is()` 比較）。

### [Reading without tracking dependencies\
不追蹤依賴關係的閱讀](https://angular.dev/guide/signals#reading-without-tracking-dependencies)

Rarely, you may want to execute code which may read signals within a reactive function such as `computed` or `effect` *without* creating a dependency.\
很少情況下，您可能希望在不創建依賴的情況下，在反應式函數中執行可能讀取信號的代碼，例如 `computed` 或 `effect` 。

For example, suppose that when `currentUser` changes, the value of a `counter` should be logged. you could create an `effect` which reads both signals:\
例如，假設當 `currentUser` 變更時，應該記錄 `counter` 的值。你可以創建一個 `effect` 來讀取這兩個信號：

```
effect(() => {  console.log(`User set to ${currentUser()} and the counter is ${counter()}`);});
```

check

This example will log a message when *either* `currentUser` or `counter` changes. However, if the effect should only run when `currentUser` changes, then the read of `counter` is only incidental and changes to `counter` shouldn't log a new message.\
這個範例會在 `currentUser` 或 `counter` 變更時記錄一條訊息。然而，如果效果僅在 `currentUser` 變更時運行，那麼對 `counter` 的讀取只是偶然的，對 `counter` 的變更不應該記錄新的訊息。

You can prevent a signal read from being tracked by calling its getter with `untracked`:\
您可以通過使用 `untracked` 調用其獲取器來防止信號讀取被跟踪：

```
effect(() => {  console.log(`User set to ${currentUser()} and the counter is ${untracked(counter)}`);});
```

check

`untracked` is also useful when an effect needs to invoke some external code which shouldn't be treated as a dependency:\
`untracked` 在需要調用一些不應被視為依賴的外部代碼時也很有用：

```
effect(() => {  const user = currentUser();  untracked(() => {    // If the `loggingService` reads signals, they won't be counted as    // dependencies of this effect.    this.loggingService.log(`User set to ${user}`);  });});
```

check

### [Effect cleanup functions\
效果清理函數](https://angular.dev/guide/signals#effect-cleanup-functions)

Effects might start long-running operations, which you should cancel if the effect is destroyed or runs again before the first operation finished. When you create an effect, your function can optionally accept an `onCleanup` function as its first parameter. This `onCleanup` function lets you register a callback that is invoked before the next run of the effect begins, or when the effect is destroyed.\
效果可能會啟動長時間運行的操作，如果效果被銷毀或在第一次操作完成之前再次運行，則應取消這些操作。當您創建一個效果時，您的函數可以選擇性地接受一個 `onCleanup` 函數作為其第一個參數。這個 `onCleanup` 函數讓您註冊一個回調，該回調在效果的下一次運行開始之前或當效果被銷毀時被調用。

```
effect((onCleanup) => {  const user = currentUser();  const timer = setTimeout(() => {    console.log(`1 second ago, the user became ${user}`);  }, 1000);  onCleanup(() => {    clearTimeout(timer);  });});
```

check

[Using signals with RxJS\
使用 RxJS 的信號](https://angular.dev/guide/signals#using-signals-with-rxjs)
-------------------------------------------------------------------------------------------------

See [RxJS interop with Angular signals](https://angular.dev/ecosystem/rxjs-interop) for details on interoperability between signals and RxJS.\
查看 RxJS 與 Angular 信號的互操作性以了解信號與 RxJS 之間的互操作性詳情。

# 型別
## signal (function)
Create a `[Signal](https://angular.dev/api/core/Signal)` that can be set or updated directly.

[API](https://angular.dev/api/core/signal#api)
----------------------------------------------

```
function signal<T>(  initialValue: T,  options?: CreateSignalOptions<T> | undefined): WritableSignal<T>;
```

### signal

`[WritableSignal](https://angular.dev/api/core/WritableSignal)<T>`

Create a `[Signal](https://angular.dev/api/core/Signal)` that can be set or updated directly.

@paraminitialValue`T`

@paramoptions`[CreateSignalOptions](https://angular.dev/api/core/CreateSignalOptions)<T> | undefined`

@returns`[WritableSignal](https://angular.dev/api/core/WritableSignal)<T>`

## CreateSignalOptions (Interface)
Create a `[Signal](https://angular.dev/api/core/Signal)` that can be set or updated directly.

[API](https://angular.dev/api/core/signal#api)
----------------------------------------------

```
function signal<T>(  initialValue: T,  options?: CreateSignalOptions<T> | undefined): WritableSignal<T>;
```Options passed to the `[signal](https://angular.dev/api/core/signal)` creation function.

[API](https://angular.dev/api/core/CreateSignalOptions#api)
-----------------------------------------------------------

```
interface CreateSignalOptions<T> {  equal?: ValueEqualityFn<T> | undefined;  debugName?: string | undefined;}
```

### equal

`[ValueEqualityFn](https://angular.dev/api/core/ValueEqualityFn)<T> | undefined`

A comparison function which defines equality for signal values.

### debugName

`string | undefined`

A debug name for the signal. Used in Angular DevTools to identify the signal.

### signal

`[WritableSignal](https://angular.dev/api/core/WritableSignal)<T>`

Create a `[Signal](https://angular.dev/api/core/Signal)` that can be set or updated directly.

@paraminitialValue`T`

@paramoptions`[CreateSignalOptions](https://angular.dev/api/core/CreateSignalOptions)<T> | undefined`

@returns`[WritableSignal](https://angular.dev/api/core/WritableSignal)<T>`

## ValueEqualityFn (Type Alias)
A comparison function which can determine if two values are equal.

API
```typescript
type ValueEqualityFn<T> = (a: T, b: T) => boolean
```

## WritableSignal(interface)
A `Signal` with a value that can be mutated via a setter interface.

API
Create a `[Signal](https://angular.dev/api/core/Signal)` that can be set or updated directly.

[API](https://angular.dev/api/core/signal#api)
----------------------------------------------

```
function signal<T>(  initialValue: T,  options?: CreateSignalOptions<T> | undefined): WritableSignal<T>;
```Options passed to the `[signal](https://angular.dev/api/core/signal)` creation function.

[API](https://angular.dev/api/core/CreateSignalOptions#api)
-----------------------------------------------------------

```
interface CreateSignalOptions<T> {  equal?: ValueEqualityFn<T> | undefined;  debugName?: string | undefined;}[API](https://angular.dev/api/core/WritableSignal#api)
------------------------------------------------------

```
interface WritableSignal<T> extends Signal<T> {  set(value: T): void;  update(updateFn: (value: T) => T): void;  asReadonly(): Signal<T>;}
```

### set

`void`

Directly set the signal to a new value, and notify any dependents.

@paramvalue`T`

@returns`void`

### update

`void`

Update the value of the signal based on its current value, and notify any dependents.

@paramupdateFn`(value: T) => T`

@returns`void`

### asReadonly

`[Signal](https://angular.dev/api/core/Signal)<T>`

Returns a readonly version of this signal. Readonly signals can be accessed to read their value but can't be changed using set or update methods. The readonly signals do *not* have any built-in mechanism that would prevent deep-mutation of their value.

@returns`[Signal](https://angular.dev/api/core/Signal)<T>`
```

### equal

`[ValueEqualityFn](https://angular.dev/api/core/ValueEqualityFn)<T> | undefined`

A comparison function which defines equality for signal values.

### debugName

`string | undefined`

A debug name for the signal. Used in Angular DevTools to identify the signal.

### signal

`[WritableSignal](https://angular.dev/api/core/WritableSignal)<T>`

Create a `[Signal](https://angular.dev/api/core/Signal)` that can be set or updated directly.

@paraminitialValue`T`

@paramoptions`[CreateSignalOptions](https://angular.dev/api/core/CreateSignalOptions)<T> | undefined`

@returns`[WritableSignal](https://angular.dev/api/core/WritableSignal)<T>`

## computed (fuction)
Create a computed `Signal` which derives a reactive value from an expression.

API
```
function computed<T>(  computation: () => T,  options?: CreateComputedOptions<T> | undefined): Signal<T>;
```

### computed

`[Signal](https://angular.dev/api/core/Signal)<T>`

Create a computed `[Signal](https://angular.dev/api/core/Signal)` which derives a reactive value from an expression.

@paramcomputation`() => T`

@paramoptions`[CreateComputedOptions](https://angular.dev/api/core/CreateComputedOptions)<T> | undefined`

@returns`[Signal](https://angular.dev/api/core/Signal)<T>`

