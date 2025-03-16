import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { signal, computed, effect, untracked, WritableSignal } from '@angular/core';

@Component({
  selector: 'app-signal-demo',
  standalone: true,
  imports: [CommonModule],
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
  // 比對相同值，不會更新
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

  constructor() {
    // 基本 effect
    effect(() => {
      console.log('tracked effect');
      const count = this.effectCount();
      this.effectColor = count % 2 === 0 ? '#e6ffe6' : '#ffe6e6';
    });

    // untracked effect
    effect(() => {
      console.log('untracked effect');
      const count = untracked(() => this.untrackedCount());
      this.untrackedColor = count % 2 === 0 ? '#e6ffe6' : '#ffe6e6';
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
}
