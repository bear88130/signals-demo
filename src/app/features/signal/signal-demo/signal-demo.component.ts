import { ChangeDetectionStrategy, Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { signal, computed, effect, untracked, WritableSignal } from '@angular/core';
import { delay, of } from 'rxjs';

interface User {
  id: number;
  name: string;
  age: number;
}

@Component({
  selector: 'app-signal-demo',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="demo-container">
      <!-- 步驟一：基本 Signal 展示 -->
      <section class="demo-section">
        <h2>步驟一：基本 Signal 展示</h2>

        <!-- 基本 signal -->
        <div class="demo-box">
          <h3>基本 Signal</h3>
          <p>計數: {{ basicCount() }}</p>
          <button (click)="increment(basicCount)">+1</button>
        </div>

        <!-- 有初始值的 signal -->
        <div class="demo-box">
          <h3>有初始值的 Signal</h3>
          <p>計數: {{ initCount() }}</p>
          <button (click)="increment(initCount)">+1</button>
        </div>

        <!-- 有相等函數的 signal -->
        <div class="demo-box">
          <h3>有相等函數的 Signal</h3>
          <p>計數: {{ equalCount() }}</p>
          <button (click)="increment(equalCount)">+1</button>
        </div>
      </section>

      <!-- 步驟二：Computed Signal 展示 -->
      <section class="demo-section">
        <h2>步驟二：Computed Signal 展示</h2>

        <!-- 無初始值的 computed -->
        <div class="demo-box">
          <h3>無初始值的 Computed</h3>
          @if (noInitCount()) {
            <p>原始值: {{ noInitCount() }}</p>
            <p>計算值: {{ noInitComputed() }}</p>
          }
          <button (click)="increment(noInitCount)">+1</button>
        </div>

        <!-- 有初始值的 computed -->
        <div class="demo-box">
          <h3>有初始值的 Computed</h3>
          <p>原始值: {{ hasInitCount() }}</p>
          <p>計算值: {{ hasInitComputed() }}</p>
          <button (click)="increment(hasInitCount)">+1</button>
        </div>
      </section>

      <!-- 步驟三：Effect 展示 -->
      <section class="demo-section">
        <h2>步驟三：Effect 展示</h2>

        <!-- 基本 effect -->
        <div class="demo-box" [style.background-color]="effectColor">
          <h3>基本 Effect</h3>
          <p>計數: {{ effectCount() }}</p>
          <button (click)="incrementMoreTimes(effectCount)">+1</button>
        </div>

        <!-- untracked effect -->
        <div class="demo-box" [style.background-color]="untrackedColor">
          <h3>Untracked Effect</h3>
          <p>計數: {{ untrackedCount() }}</p>
          <button (click)="incrementMoreTimes(untrackedCount)">+1</button>
          <!-- 顯示 code 是什麼 -->
          <p>untracked(() => this.untrackedCount())</p>
        </div>
      </section>

      <!-- 步驟四：物件 Signal 展示 -->
      <section class="demo-section">
        <h2>步驟四：物件 Signal 展示</h2>

        <!-- 修改物件屬性 -->
        <div class="demo-box">
          <h3>方法一：call api 後 修改物件屬性，不替換 object reference (他會因為 事件 刷新 UI)</h3>
          <p>使用者資訊: {{ userInfo().name }}, {{ userInfo().age }} 歲</p>
          <button (click)="updateUserAge()">年齡 +1 (修改屬性)</button>
        </div>

        <!-- 替換為新物件 -->
        <div class="demo-box">
          <h3>方法二：call api 後 替換為新物件，替換 object reference</h3>
          <p>使用者資訊: {{ userInfo2().name }}, {{ userInfo2().age }} 歲</p>
          <button (click)="replaceUserObject()">年齡 +1 (新物件)</button>
        </div>

        <!-- 物件比較結果 -->
        <div class="demo-box">
          <h3>物件更新效能比較</h3>
          <p>方法一 (修改屬性) 更新次數: {{ updateCount() }}</p>
          <p>方法二 (新物件) 更新次數: {{ replaceCount() }}</p>
        </div>
      </section>
    </div>
  `,
  styles: [`
    .demo-container {
      padding: 20px;
      max-width: 800px;
      margin: 0 auto;
    }
    .demo-section {
      margin-bottom: 40px;
      padding: 20px;
      border: 1px solid #ddd;
      border-radius: 8px;
    }
    .demo-box {
      margin: 20px 0;
      padding: 20px;
      border: 1px solid #ccc;
      border-radius: 4px;
      transition: background-color 0.3s;
    }
    button {
      padding: 8px 16px;
      margin: 8px;
      border: none;
      border-radius: 4px;
      background-color: #4CAF50;
      color: white;
      cursor: pointer;
    }
    button:hover {
      background-color: #45a049;
    }
    h2 {
      color: #333;
      margin-bottom: 20px;
    }
    h3 {
      color: #666;
      margin-bottom: 10px;
    }
  `]
})
export class SignalDemoComponent {
  // 步驟一：基本 Signal 展示
  basicCount = signal(undefined);
  initCount = signal(100);
  // 比對到相同值，不會更新
  equalCount = signal(0, { equal: (a, b) => {
    console.log('equalCount', a, b);
    return a === 5}
  });

  // 步驟二：Computed Signal 展示
  noInitCount = signal(undefined);
  noInitComputed = computed(() => {
    if (this.noInitCount() !== undefined) {
      return `計算結果: ${this.noInitCount()! * 2}`
    } else {
      return ``
    }
  });

  hasInitCount = signal(50);
  hasInitComputed = computed(() => `計算結果: ${this.hasInitCount() * 2}`);

  // 步驟三：Effect 展示
  effectCount = signal(0);
  effectColor = 'white';
  untrackedCount = signal(0);
  untrackedColor = 'white';

  // 步驟四：物件 Signal 展示
  userInfo = signal<User>({ id: 1, name: '小明', age: 25 });
  userInfo2 = signal<User>({ id: 2, name: '小華', age: 25 });
  updateCount = signal(0);
  replaceCount = signal(0);

  constructor() {
    // 基本 effect
    effect(() => {
      console.log('tracked effect');
      const count = this.effectCount();
      this.effectColor = count % 2 === 0 ? '#e6ffe6' : '#ffe6e6';
    });

    // untracked effect
    // 不追蹤不代表沒有改變，由別個 signal 觸發，一樣會改變
    effect(() => {
      console.log('untracked effect');
      const effectCountCount = this.effectCount();
      const untrackedCount = untracked(() => this.untrackedCount());
      console.log('untracked count', untrackedCount);
      this.untrackedColor = untrackedCount % 2 === 0 ? '#e6ffe6' : '#ffe6e6';
    });

    // // 物件更新監聽
    effect(() => {
      // 只要 userInfo 的任何屬性改變，這個 effect 就會觸發
      console.log('userInfo changed', this.userInfo());
      this.updateCount.update(count => count + 1);
    });

    effect(() => {
      // 只要 userInfo2 的任何屬性改變，這個 effect 就會觸發
      console.log('userInfo2 changed', this.userInfo2());
      this.replaceCount.update(count => count + 1);
    });
  }

  increment(signal: WritableSignal<number | undefined>) {
    signal.update((value: number | undefined) => value ? value + 1 : 1);
  }

  incrementMoreTimes(signal: WritableSignal<number | undefined>) {
      signal.update((value: number | undefined) => value ? value + 1 : 1);
      signal.update((value: number | undefined) => value ? value + 1 : 1);
      signal.update((value: number | undefined) => value ? value + 1 : 1);
  }

  // 事件本身也會觸發更新
  // 方法一：修改物件屬性
  updateUserAge() {
    // call 一個 非同步的 observer 會觸發更新
    of(1).pipe(delay(500)).subscribe(() => {
      const current = this.userInfo();
      current.age += 1; // 修改物件的屬性
      this.userInfo.set(current);
    });

  }

  // 方法二：替換為新物件
  replaceUserObject() {
    of(1).pipe(delay(500)).subscribe(() => {
      this.userInfo2.update(user => {
        // 建立一個新物件並返回
        return { ...user, age: user.age + 1 };
      });
    });
  }
}
