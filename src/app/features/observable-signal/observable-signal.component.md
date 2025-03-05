toObservableSignal() combines the functionality of Angular Signal and RxJS Observable.
toObservableSignal() 結合了 Angular Signal 和 RxJS Observable 的功能。

This function uses toObservable() from @angular/core/rxjs-interop under the hood, so it should be called in an injection context, or the injector should be passed as the second argument (options).
此功能在底層使用 toObservable() 來自 @angular/core/rxjs-interop ，因此應在注入上下文中調用，或者應將 injector 作為第二個參數（選項）傳遞。

import { toObservableSignal } from 'ngxtension/to-observable-signal';

Usage  使用方式
@Component({
  selector: 'my-app',
  standalone: true,
  imports: [CommonModule],
  template: `
    <h2>Signal A: {{ a() }}</h2>
    <h2>Observable A: {{ a | async }}</h2>
    <h2>Observable B (A*2): {{ b | async }}</h2>
    <h2>Signal C (A*3): {{ c() }}</h2>
  `,
})
export class App {
  a = toObservableSignal(signal<number>(0));
  b = this.a.pipe(
    switchMap((v) => {
      return of(v * 2);
    }),
  );
  c = computed(() => this.a() * 3);

  constructor() {
    setInterval(() => this.a.set(1), 10000);
    setInterval(() => this.a.update((v) => v + 1), 1000);
  }
}

toObservableSignal() accepts a Signal or WritableSignal as the first argument.
toObservableSignal() 接受 Signal 或 WritableSignal 作為第一個參數。
The second argument is optional - it is a ToObservableOptions object, which is the exact type used by toObservable(). Here, you can set the injector.
第二個參數是可選的 - 它是一個 ToObservableOptions 物件，這是 toObservable() 使用的確切類型。在這裡，您可以設置注入器。
