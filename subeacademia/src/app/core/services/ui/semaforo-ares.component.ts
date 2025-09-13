import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-semaforo-ares-chips',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="flex flex-wrap gap-2">
      <div *ngFor="let f of aresScores" class="px-3 py-1 rounded-full text-sm font-semibold"
        [ngClass]="{
          'bg-red-500 text-white': f.score < 50,
          'bg-amber-500 text-black': f.score >= 50 && f.score < 70,
          'bg-green-500 text-white': f.score >= 70
        }">
        {{ f.name }}
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SemaforoAresChipsComponent {
  @Input() aresScores: { name: string; score: number }[] = [];
}


