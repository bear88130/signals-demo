import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-timeout-demo',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="p-4">
      <h2 class="text-xl font-bold mb-4">setTimeout Demo</h2>

      <div class="mb-6">
        <h3 class="font-semibold mb-2">使用 Signal</h3>
        <p>當前值: {{ signalCount() }}</p>
        <button (click)="startSignalTimeout()"
                class="bg-blue-500 text-white px-4 py-2 rounded">
          開始 Signal 計時
        </button>
      </div>

      <div class="mb-6">
        <h3 class="font-semibold mb-2">使用普通變數</h3>
        <p>當前值: {{ normalCount }}</p>
        <button (click)="startNormalTimeout()"
                class="bg-green-500 text-white px-4 py-2 rounded">
          開始普通變數計時
        </button>
      </div>
    </div>
  `
})
export class TimeoutDemoComponent {
  signalCount = signal(0);
  normalCount = 0;

  startSignalTimeout() {
    setTimeout(() => {
      this.signalCount.set(this.signalCount() + 1);
    }, 1000);
  }

  startNormalTimeout() {
    setTimeout(() => {
      this.normalCount += 1;
    }, 1000);
  }
}
