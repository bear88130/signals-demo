connect is a utility function that connects a signal to an observable and returns a subscription. The subscription is automatically unsubscribed when the component is destroyed. If it’s not called in an injection context, it must be called with an injector or DestroyRef.
connect 是一個將信號連接到可觀察對象的工具函數，並返回一個訂閱。當組件被銷毀時，訂閱會自動取消訂閱。如果它不是在注入上下文中調用的，則必須使用注入器或 DestroyRef 來調用。

import { connect } from 'ngxtension/connect';

Usage  使用方式
It can be helpful when you want to have a writable signal, but you want to set its value based on an observable.
當你想要有一個可寫的信號，但又想根據可觀察的值來設置它的值時，這會很有幫助。

Connect with observables
連接可觀察對象
For example, you might want to have a signal that represents the current page number, but you want to set its value based on an observable that represents the current page number from a data service.
例如，您可能想要有一個信號來表示當前頁碼，但您希望根據來自數據服務的可觀察對象來設置其值，該可觀察對象表示當前頁碼。

@Component()
export class AppComponent implements OnDestroy {
  private dataService = inject(DataService);

  pageNumber = signal(1);

  constructor() {
    connect(this.pageNumber, this.dataService.pageNumber$);
  }
}

Connect with observables not in an injection context
在非注入上下文中連接可觀察對象
You can also use it not in an injection context, but you must provide an injector or DestroyRef.
您也可以在非注入上下文中使用它，但您必須提供一個注入器或 DestroyRef。

@Component()
export class AppComponent implements OnDestroy {
  private dataService = inject(DataService);

  private injector = inject(Injector);
  // or
  private destroyRef = inject(DestroyRef);

  pageNumber = signal(1);

  ngOnInit() {
    connect(this.pageNumber, this.dataService.pageNumber$, this.injector);

    // or

    connect(this.pageNumber, this.dataService.pageNumber$, this.destroyRef);
  }
}

Connect with other signals
與其他信號連接
This is useful when you want to have a writable signal, but you want to update its value based on another signal that represents the current state of that value. For this to work, the second argument must be a callback function that includes a signal call inside of it.
這在您想要擁有可寫信號時非常有用，但您希望根據另一個表示該值當前狀態的信號來更新其值。為了使這能夠運作，第二個參數必須是一個回調函數，該函數內部包含一個信號調用。

@Component()
export class AppComponent implements OnDestroy {
  private dataService = inject(DataService);

  pageNumber = signal(1);

  constructor() {
    connect(this.pageNumber, () => this.dataService.state().pageNumber);
  }
}

Object Signal  物件信號
There are cases where we construct a single Signal to store a state object. connect can also work with object signals
有些情況下，我們構建一個單一的 Signal 來存儲狀態對象。 connect 也可以與對象信號一起工作。

@Component()
export class MyComponent {
  state = signal({
    user: {
      firstName: 'chau',
      lastName: 'tran',
    },
  });

  firstName = computed(() => this.state().user.firstName);
  lastName = computed(() => this.state().user.lastName);

  lastName$ = new Subject<string>();

  constructor() {
    effect(() => {
      console.log('first name changed', this.firstName());
    });

    // we want to connect `lastName$` stream to `state`
    // and when `lastName$` emits, update the state with the `reducer` fn
    connect(this.state, this.lastName$, (prev, lastName) => ({
      user: { ...prev.user, lastName },
    }));

    // logs: first name changed, chau

    // sometimes later
    this.lastName$.next('Tran');

    // `firstName()` effect won't be triggered because we only update `lastName`
  }
}

ConnectedSignal
A ConnectedSignal allows you to connect any number of streams to a signal during or after the initial connect call.
一個 ConnectedSignal 允許您在初始連接調用期間或之後將任意數量的流連接到信號。

const connectedSignal = connect(this.state)
  .with(this.lastName$, (prev, lastName) => ({ user: { ...prev.user, lastName } }))
  .with(this.firstName$, (prev, firstName) => ({ user: { ...prev.user, firstName } }));

/* can connect later as well */
connectedSignal.with(/* ... */);

/* can destroy */
connectedSignal.subscription.unsubscribe();

/* after the subscription is closed, connectedSignal doesn't so anything */
connectedSignal.with(/* ...*/)); // won't connect

A benefit of this approach is that it allows you to connect multiple streams to a signal whilst utilising different syntax for the connect call.
這種方法的一個好處是，它允許您將多個流連接到一個信號，同時使用不同的語法來調用 connect 。

For example, if your streams directly emit the values you want to set into the signal, you can use this syntax:
例如，如果您的流直接發出您想要設置到信號中的值，您可以使用這種語法：

connect(this.pageNumber, this.dataService.pageNumber$);

Or, if you need to use a reducer to access the previous signal value, you can use this syntax:
或者，如果您需要使用減速器來訪問先前的信號值，您可以使用這個語法：

connect(this.state, this.lastName$, (prev, lastName) => ({
  user: { ...prev.user, lastName },
}));

However, if you want to use multiple different streams with different reducers, you would need to use multiple connect calls (one for each reducer you want to add), e.g:
然而，如果您想使用多個不同的流和不同的減少器，您需要使用多個連接調用（每個您想添加的減少器一個），例如：

connect(this.state, this.someStream$);

connect(this.state, this.add$, (state, checklist) => ({
  checklists: [...state.checklists, checklist],
}));

connect(this.state, this.remove$, (state, id) => ({
  checklists: state.checklists.filter((checklist) => checklist.id !== id),
}));

With a ConnectedSignal you can use the with syntax to chain these into a single connect call:
使用 ConnectedSignal ，您可以使用 with 語法將這些鏈接成一個單一的連接調用：

connect(this.state)
  .with(this.someStream$)
  .with(this.lastName$, (prev, lastName) => ({
    user: { ...prev.user, lastName },
  }))
  .with(this.firstName$, (prev, firstName) => ({
    user: { ...prev.user, firstName },
  }));

This allows for any combination of streams without reducers and streams with different types of reducers.
這允許任何不使用減少器的流和具有不同類型減少器的流的組合。
