import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-promise-demo',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="p-4">
      <h2 class="text-xl font-bold mb-4">Promise Demo</h2>

      <div class="mb-6">
        <h3 class="font-semibold mb-2">使用 Signal</h3>
        <p>狀態: {{ signalStatus() }}</p>
        <p>數據: {{ signalData() }}</p>
        <button (click)="loadSignalData()"
                class="bg-blue-500 text-white px-4 py-2 rounded"
                [disabled]="signalStatus() === '加載中...'">
          加載 Signal 數據
        </button>
      </div>

      <div class="mb-6">
        <h3 class="font-semibold mb-2">使用普通變數</h3>
        <p>狀態: {{ normalStatus }}</p>
        <p>數據: {{ normalData }}</p>
        <button (click)="loadNormalData()"
                class="bg-green-500 text-white px-4 py-2 rounded"
                [disabled]="normalStatus === '加載中...'">
          加載普通數據
        </button>
      </div>
    </div>
  `
})
export class PromiseDemoComponent {
  signalStatus = signal<string>('就緒');
  signalData = signal<string>('無數據');

  normalStatus = '就緒';
  normalData = '無數據';

  // 模擬異步請求
  private simulateAsyncRequest(): Promise<string> {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve('這是從服務器獲取的數據 ' + new Date().toLocaleTimeString());
      }, 2000);
    });
  }

  async loadSignalData() {
    this.signalStatus.set('加載中...');
    try {
      const result = await this.simulateAsyncRequest();
      this.signalData.set(result);
      this.signalStatus.set('完成');
    } catch (error) {
      this.signalStatus.set('錯誤');
      this.signalData.set('加載失敗');
    }
  }

  async loadNormalData() {
    this.normalStatus = '加載中...';
    try {
      const result = await this.simulateAsyncRequest();
      this.normalData = result;
      this.normalStatus = '完成';
    } catch (error) {
      this.normalStatus = '錯誤';
      this.normalData = '加載失敗';
    }
  }
}
