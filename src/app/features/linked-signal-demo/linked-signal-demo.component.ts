import { Component, signal, computed, linkedSignal, WritableSignal, Signal, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-linked-signal-demo',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="shipping-container">
      <h2>Shipping Options</h2>

      <div class="options-list">
        <select [ngModel]="selectedOption()"
                (ngModelChange)="selectedOption.set($event)"
                style="padding: 8px; border: 2px solid #a8d5ff; border-radius: 4px; margin-right: 10px;">
          <option *ngFor="let option of shippingOptions()"
                  [value]="option">
            {{option}}
          </option>
        </select>

        <button (click)="generateRandomOptions()"
                style="padding: 8px 16px; border: 2px solid #a8d5ff; border-radius: 4px; background-color: white; cursor: pointer;">
          Generate Random Options
        </button>
      </div>

      <div class="selected-option">
        <p>Selected shipping method: <strong>{{selectedOption()}}</strong></p>
      </div>
    </div>
  `
})
export class LinkedSignalDemoComponent  {
  shippingOptions: WritableSignal<string[]> = signal([]);
  // selectedOption: WritableSignal<string> = linkedSignal(() => this.shippingOptions()[0]);

  selectedOption = signal('');


  constructor() {
    this.generateRandomOptions();

    effect(() => {
      const _shippingOptions = this.shippingOptions()
      this.selectedOption.set(_shippingOptions[0])
    })
  }

  generateRandomOptions() {
    const allOptions = [
      'Express', 'Ground', 'Air', 'Sea', 'Email',
      'Will Call', 'Postal service', 'Drone Delivery',
      'Same Day', 'Next Day'
    ];
    const count = Math.floor(Math.random() * 5) + 3; // Generate 3-7 options
    const shuffled = [...allOptions].sort(() => Math.random() - 0.5);
    this.shippingOptions.set(shuffled.slice(0, count));
  }
}
