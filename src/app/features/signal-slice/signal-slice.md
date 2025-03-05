`signalSlice` is loosely inspired by the `createSlice` API from Redux Toolkit. The general idea is that it allows you to declaratively create a "slice" of state. This state will be available as a **readonly** signal.\
`signalSlice` 的靈感來源於 Redux Toolkit 的 `createSlice` API。一般來說，它允許您以聲明方式創建一個"狀態切片"。這個狀態將作為只讀信號可用。

The key motivation, and what makes this declarative, is that all the ways for updating this signal are declared upfront with `sources` and `actionSources`. It is not possible to imperatively update the state.\
主要的動機，以及使這具有聲明性的原因，是所有更新此信號的方法都在前面用 `sources` 和 `actionSources` 宣告。無法以命令式更新狀態。

Basic Usage基本用法
---------------

```
import { signalSlice } from 'ngxtension/signal-slice';
```

```
  private initialState: ChecklistsState = {    checklists: [],    loaded: false,    error: null,  };
  state = signalSlice({    initialState: this.initialState,  });
```

The returned `state` object will be a standard **readonly** signal, but it will also have properties attached to it that will be discussed below.\
返回的 `state` 物件將是一個標準的只讀信號，但它還會附加一些屬性，這些屬性將在下面討論。

You can access the state as you would with a typical signal:\
您可以像使用典型信號一樣訪問狀態：

```
this.state().loaded;
```

However, by default `computed` selectors will be created for each top-level property in the initial state:\
然而，根據預設， `computed` 選擇器將為初始狀態中的每個頂層屬性創建

```
this.state.loaded();
```

Sources來源
---------

One way to update state is through the use of `sources`. These are intended to be used for "auto sources" --- as in, observable streams that will emit automatically like an `http.get()`. Although it will work with a `Subject` that you `next` as well, it is recommended that you use an **actionSource** for these imperative style state updates.\
更新狀態的一種方法是通過使用 `sources` 。這些旨在用於"自動來源"------即，像 `http.get()` 一樣會自動發出可觀察的流。雖然它也可以與您 `next` 的 `Subject` 一起使用，但建議您對於這些命令式風格的狀態更新使用 actionSource。

You can supply a source like this:\
您可以提供這樣的來源：

```
loadChecklists$ = this.checklistsLoaded$.pipe(  map((checklists) => ({ checklists, loaded: true })),);
state = signalSlice({  initialState: this.initialState,  sources: [this.loadChecklists$],});
```

The `source` should be mapped to a partial of the `initialState`. In the example above, when the source emits it will update both the `checklists` and the `loaded` properties in the state signal.\
`source` 應該映射到 `initialState` 的一部分。在上面的例子中，當源發出時，它將更新狀態信號中的 `checklists` 和 `loaded` 屬性。

If you need to utilise the current state in a source, instead of supplying the observable directly as a source you can supply a function that accepts the state signal and returns the source:\
如果您需要在源中利用當前狀態，您可以提供一個接受狀態信號並返回源的函數，而不是直接將可觀察對象作為源：

```
state = signalSlice({  initialState: this.initialState,  sources: [    this.loadChecklists$,    (state) =>      this.newMessage$.pipe(        map((newMessage) => ({          messages: [...state().messages, newMessage],        })),      ),  ],});
```

Lazy Loading懶加載

If you want any sources to be loaded only *after* the `signalSlice` is accessed, you can use the `lazySources` configuration.\
如果您希望任何資源僅在訪問 `signalSlice` 後加載，可以使用 `lazySources` 配置。

Action Sources行動來源
------------------

Another way to update the state is through `actionSources`. An action source creates an **action** that you can call, and it returns a **source** that is used to update the state.\
另一種更新狀態的方法是通過 `actionSources` 。一個動作來源創建一個你可以調用的動作，並返回一個用於更新狀態的來源。

This is good for situations where you need to manually/imperatively trigger some action, and then use the current state in some way in order to calculate the new state.\
這對於需要手動/強制觸發某些行動的情況非常有用，然後以某種方式使用當前狀態來計算新狀態。

When you supply an `actionSource`, it will automatically create an `action` that you can call. Action Sources can be created like this:\
當您提供一個 `actionSource` 時，它將自動創建一個您可以調用的 `action` 。動作來源可以這樣創建：

```
state = signalSlice({  initialState: this.initialState,  actionSources: {    add: (state, action$: Observable<AddChecklist>) =>      action$.pipe(        map((checklist) => ({          checklists: [...state().checklists, checklist],        })),      ),    remove: (state, action$: Observable<RemoveChecklist>) =>      action$.pipe(        map((id) => ({          checklists: state().checklists.filter(            (checklist) => checklist.id !== id,          ),        })),      ),  },});
```

Actions are created automatically using whatever name you provide for the `actionSource` and can be called like this:\
動作是自動創建的，使用您為 `actionSource` 提供的任何名稱，並可以像這樣調用：

```
this.state.add(checklist);
```

It is also possible to have an `actionSource` without any payload. For example sometimes people might want to manually trigger a load:\
也可以有一個 `actionSource` 而不帶任何有效載荷。例如，有時人們可能想手動觸發一個加載：

```
  state = signalSlice({    initialState: this.initialState,    actionSources: {      load: (_state, $: Observable<void>) => $.pipe(        switchMap(() => this.someService.load()),        map(data => ({ someProperty: data })      )    }  })
```

In this particular case, a `load` action will be created that can be called with `this.state.load()`.\
在這個特定的情況下，將創建一個 `load` 動作，可以使用 `this.state.load()` 來調用。

**NOTE:** This example covers the use case where data *needs* to be manually triggered with a `load()` action. It is also possible to just have your data load automatically --- in this case the observable that loads the data can just be supplied directly through `sources` rather than `actionSources` and it will be loaded automatically without needing to trigger the `load()` action.\
注意：此範例涵蓋了需要手動觸發 `load()` 動作的使用情境。也可以讓數據自動加載------在這種情況下，負責加載數據的可觀察對象可以直接通過 `sources` 提供，而不是 `actionSources` ，這樣就可以自動加載，而無需觸發 `load()` 動作。

It is also possible to supply an external subject as an `actionSource` like this:\
也可以像這樣提供一個外部主題作為 `actionSource` ：

```
someAction$ = new Subject<void>();
state = signalSlice({  initialState: this.initialState,  actionSources: {    someAction: someAction$,  },});
```

This is useful for circumstances where you need any of your `sources` to react to `someAction$` being triggered. A source can not react to internally created `actionSources`, but it can react to the externally created subject. Supplying this subject as an `actionSource` allows you to still trigger it through `state.someAction()`. This makes using actions more consistent, as everything can be accessed on the state object, even if you need to create an external subject.\
這在您需要任何 `sources` 對 `someAction$` 被觸發作出反應的情況下非常有用。來源無法對內部創建的 `actionSources` 作出反應，但可以對外部創建的主題作出反應。將此主題作為 `actionSource` 提供，允許您仍然通過 `state.someAction()` 觸發它。這使得使用動作更加一致，因為即使您需要創建一個外部主題，所有內容都可以在狀態對象上訪問。

Action Updates行動更新
------------------

:::caution Action Updates are currently experimental, the API may be changed or removed entirely. Please feel free to reach out to joshuamorony with feedback or open an issue. :::\
:::警告 行動更新目前是實驗性的，API 可能會被更改或完全移除。請隨時聯繫 joshuamorony 提供反饋或提出問題。:::

Each `actionSource` will have an equivalent `Updated` version signal automatically generated that will be incremented each time the `actionSource` emits or completes, e.g:\
每個 `actionSource` 將自動生成一個等效的 `Updated` 版本信號，該信號將在每次 `actionSource` 發出或完成時遞增，例如：

```
  state = signalSlice({    initialState: this.initialState,    actionSources: {      load: (_state, $: Observable<void>) => $.pipe(        switchMap(() => this.someService.load()),        map(data => ({ someProperty: data })      )    }  })
  effect(() => {    // triggered when `load` emits/completes and on init    console.log(state.loadUpdated())  })
```

This signal will return the current version, starting at `0`. If you do not want your `effect` to be triggered on initialisation you can check for the `0` version value, e.g:\
此信號將返回當前版本，從 `0` 開始。如果您不希望在初始化時觸發您的 `effect` ，您可以檢查 `0` 版本值，例如：

```
effect(() => {  if (state.loadUpdated()) {    // triggered ONLY when `load` emits/completes    // NOT on init  }});
```

Action Streams行動串流
------------------

The source/stream for each action is also exposed on the state object. That means that you can access:\
每個動作的來源/流也在狀態對象上暴露。這意味著您可以訪問：

```
this.state.add$;
```

Which will allow you to react to the `add` action being called via an observable.\
這將允許您通過可觀察對 `add` 動作的調用做出反應。

Selectors選擇器
------------

By default, all of the top-level properties from the initial state will be exposed as selectors which are `computed` signals on the state object.\
根據預設，初始狀態中的所有頂層屬性將作為選擇器暴露，這些選擇器是狀態對象上的 `computed` 信號。

It is also possible to create more selectors simply using `computed` and the values of the signal created by `signalSlice`, however, it is awkward to have some selectors available directly on the state object (our default selectors) and others defined outside of the state object.\
也可以僅使用 `computed` 和 `signalSlice` 創建的信號值來創建更多選擇器，不過，將某些選擇器直接放在狀態對象上（我們的默認選擇器）而其他選擇器定義在狀態對象之外會顯得有些尷尬。

It is therefore recommended to define all of your selectors using the `selectors` config of `signalSlice`:\
因此建議使用 `signalSlice` 的 `selectors` 配置來定義所有選擇器：

```
state = signalSlice({  initialState: this.initialState,  selectors: (state) => ({    loadedAndError: () => state().loaded && state().error,    whatever: () => 'hi',  }),});
```

This will also make these additional computed values available on the state object:\
這也將使這些額外的計算值可用於狀態對象：

```
this.state.loadedAndError();
```

Effects效果
---------

Caution小心

The `effects` property of `signalSlice` has been deprecated and will eventually be removed. Please use standard signal effects outside of the `signalSlice` instead.\
`signalSlice` 的 `effects` 屬性已被棄用，最終將被移除。請在 {{2 }} 之外使用標準信號效果。

To create side effects for state changes, you can use the standard Angular `effect` to react to the state signal or selectors from `signalSlice` changing, e.g:\
要為狀態變更創建副作用，您可以使用標準的 Angular `effect` 來響應來自 `signalSlice` 的狀態信號或選擇器的變化，例如：

```
const state = signalSlice({  initialState,  actionSources: {    selectVideo,    generateAudio,    uploadAudio,  },});
effect(() => {  if (state.status() === 'complete') {    // do something  }});
```

If you intend to trigger another `actionSource` from within your effects, it will be necessary to enable `allowSignalWrites` as triggering an `actionSource` will cause a value to be written to the state signal, e.g:\
如果您打算從您的效果中觸發另一個 `actionSource` ，則需要啟用 `allowSignalWrites` ，因為觸發 `actionSource` 將導致一個值寫入狀態信號，例如：

```
effect(  () => {    const status = state.status();
    if (state.status() === 'complete') {      state.uploadAudio();    }  },  { allowSignalWrites: true },);
```
