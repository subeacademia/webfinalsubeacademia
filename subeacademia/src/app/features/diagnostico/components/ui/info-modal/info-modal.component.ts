import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-info-modal',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="fixed inset-0 z-50 flex items-center justify-center" *ngIf="open">
      <div class="absolute inset-0 bg-black/50" (click)="close.emit()"></div>
      <div class="relative z-10 max-w-lg w-[90%] bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
        <div class="text-lg font-semibold mb-2 text-gray-900 dark:text-white">Información</div>
        <div class="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-line">{{ content }}</div>
        <div class="mt-6 text-right">
          <button type="button" class="btn" (click)="close.emit()">Cerrar</button>
        </div>
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InfoModalComponent {
  @Input() content = '';
  @Input() open = false;
  @Output() close = new EventEmitter<void>();
}


