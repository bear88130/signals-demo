import { Component, signal, OnDestroy, ChangeDetectionStrategy, inject, NgZone, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';

interface User {
  name: string;
  age: number;
  lastUpdate: Date;
}

@Component({
  selector: 'app-interval-demo',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="p-4">
      <h2 class="text-xl font-bold mb-4">setInterval Demo</h2>

      <div class="mb-6">
        <h3 class="font-semibold mb-2">使用 Signal</h3>
        <p>當前值: {{ signalTimer() }}</p>
        <button (click)="toggleSignalTimer()"
                [class]="signalRunning() ? 'bg-red-500' : 'bg-blue-500'"
                class="text-white px-4 py-2 rounded">
          {{ signalRunning() ? '停止' : '開始' }} Signal 計時器
        </button>
      </div>

      <div class="mb-6">
        <h3 class="font-semibold mb-2">使用普通變數</h3>
        <p>當前值: {{ normalTimer }}</p>
        <button (click)="toggleNormalTimer()"
                [class]="normalRunning ? 'bg-red-500' : 'bg-green-500'"
                class="text-white px-4 py-2 rounded">
          {{ normalRunning ? '停止' : '開始' }} 普通計時器
        </button>
      </div>

      <div class="mb-6">
        <h3 class="font-semibold mb-2">修改物件屬性</h3>
        <p>使用者: {{ userObject().name }}, 年齡: {{ userObject().age }}, 更新時間: {{ userObject().lastUpdate | date:'medium' }}</p>
        <button (click)="toggleObjectPropertyUpdate()"
                [class]="objectPropertyRunning ? 'bg-red-500' : 'bg-purple-500'"
                class="text-white px-4 py-2 rounded">
          {{ objectPropertyRunning ? '停止' : '開始' }} 修改物件屬性
        </button>
      </div>

      <div class="mb-6">
        <h3 class="font-semibold mb-2">替換整個物件</h3>
        <p>使用者: {{ replaceObject().name }}, 年齡: {{ replaceObject().age }}, 更新時間: {{ replaceObject().lastUpdate | date:'medium' }}</p>
        <button (click)="toggleObjectReplacement()"
                [class]="objectReplaceRunning ? 'bg-red-500' : 'bg-yellow-500'"
                class="text-white px-4 py-2 rounded">
          {{ objectReplaceRunning ? '停止' : '開始' }} 替換整個物件
        </button>
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class IntervalDemoComponent implements OnDestroy {
  private zone = inject(NgZone);
  private cdk = inject(ChangeDetectorRef);

  signalRunning = signal(false);
  signalTimer = signal(0);

  private signalInterval?: ReturnType<typeof setInterval>;

  normalTimer = 0;
  normalRunning = false;
  private normalInterval?: ReturnType<typeof setInterval>;

  // 物件修改範例
  userObject = signal<User>({ name: '小明', age: 25, lastUpdate: new Date() });
  objectPropertyRunning = false;
  private objectPropertyInterval?: ReturnType<typeof setInterval>;

  // 物件替換範例
  replaceObject = signal<User>({ name: '小華', age: 30, lastUpdate: new Date() });
  objectReplaceRunning = false;
  private objectReplaceInterval?: ReturnType<typeof setInterval>;

  toggleSignalTimer() {
    if (this.signalRunning()) {
      clearInterval(this.signalInterval);
      this.signalRunning.set(false);
    } else {
      this.signalInterval = setInterval(() => {
        this.signalTimer.set(this.signalTimer() + 1);
      }, 1000);
      this.signalRunning.set(true);
    }
  }

  toggleNormalTimer() {
    if (this.normalRunning) {
      clearInterval(this.normalInterval);
      this.normalRunning = false;
    } else {
      this.normalInterval = setInterval(() => {
        this.normalTimer += 1;
        // this.cdk.markForCheck();
      }, 1000);
      this.normalRunning = true;
    }
  }

  toggleObjectPropertyUpdate() {
    if (this.objectPropertyRunning) {
      clearInterval(this.objectPropertyInterval);
      this.objectPropertyRunning = false;
    } else {
      this.objectPropertyInterval = setInterval(() => {
        // 直接修改物件屬性
        this.userObject.update(user => {
          user.age += 1;
          user.lastUpdate = new Date();
          return user;
        });
      }, 1000);
      this.objectPropertyRunning = true;
    }
  }

  toggleObjectReplacement() {
    if (this.objectReplaceRunning) {
      clearInterval(this.objectReplaceInterval);
      this.objectReplaceRunning = false;
    } else {
      this.objectReplaceInterval = setInterval(() => {
        // 創建新物件進行替換
        const currentUser = this.replaceObject();
        this.replaceObject.set({
          name: currentUser.name,
          age: currentUser.age + 1,
          lastUpdate: new Date()
        });
      }, 1000);
      this.objectReplaceRunning = true;
    }
  }

  ngOnDestroy() {
    if (this.signalInterval) {
      clearInterval(this.signalInterval);
    }
    if (this.normalInterval) {
      clearInterval(this.normalInterval);
    }
    if (this.objectPropertyInterval) {
      clearInterval(this.objectPropertyInterval);
    }
    if (this.objectReplaceInterval) {
      clearInterval(this.objectReplaceInterval);
    }
  }
}
