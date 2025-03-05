import { Component, signal, OnDestroy, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';

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
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class IntervalDemoComponent implements OnDestroy {
  signalTimer = signal(0);
  signalRunning = signal(false);
  private signalInterval?: ReturnType<typeof setInterval>;

  normalTimer = 0;
  normalRunning = false;
  private normalInterval?: ReturnType<typeof setInterval>;

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
      }, 1000);
      this.normalRunning = true;
    }
  }

  ngOnDestroy() {
    if (this.signalInterval) {
      clearInterval(this.signalInterval);
    }
    if (this.normalInterval) {
      clearInterval(this.normalInterval);
    }
  }
}
