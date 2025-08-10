import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { NgIf, NgFor, NgClass } from '@angular/common';

export type CardSize = 'small' | 'medium' | 'large';

@Component({
  selector: 'app-card',
  standalone: true,
  imports: [NgIf, NgFor, NgClass],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'block group',
  },
  template: `
    <article
      class="rounded-3xl border border-[var(--border)] bg-[var(--card)] shadow-lg transition hover:shadow-xl hover:-translate-y-[2px]"
      [ngClass]="{
        'p-4 sm:p-5': size === 'small',
        'p-5 sm:p-6': size === 'medium',
        'p-6 sm:p-8': size === 'large',
      }"
    >
      <!-- Imagen opcional -->
      <ng-container *ngIf="imageUrl">
        <div class="w-full overflow-hidden rounded-2xl border border-[var(--border)] mb-4"
             [ngClass]="{
               'aspect-[4/3]': size === 'small',
               'aspect-[16/9]': size !== 'small'
             }">
          <img [src]="imageUrl!" [alt]="imageAlt || title || ''" class="w-full h-full object-cover" />
        </div>
      </ng-container>

      <!-- Contenido -->
      <div class="space-y-2">
        <h3 *ngIf="title" class="font-grotesk" [ngClass]="{
          'text-base sm:text-lg': size === 'small',
          'text-lg sm:text-xl': size === 'medium',
          'text-xl sm:text-2xl': size === 'large'
        }">{{ title }}</h3>
        <p *ngIf="description" class="text-[var(--muted)]" [ngClass]="{
          'text-sm': size === 'small',
          'text-sm sm:text-base': size === 'medium' || size === 'large'
        }">{{ description }}</p>

        <!-- Tags -->
        <div *ngIf="tags?.length" class="flex flex-wrap gap-2 pt-1">
          <span class="chip" *ngFor="let t of tags">{{ t }}</span>
        </div>
      </div>

      <!-- Acción -->
      <div class="mt-4 sm:mt-5">
        <button *ngIf="actionLabel"
                type="button"
                class="btn btn-primary"
                (click)="action.emit()"
                [attr.aria-label]="actionLabel"
        >{{ actionLabel }}</button>
        <a *ngIf="href && actionLabel"
           class="btn btn-primary"
           [href]="href"
           [attr.target]="target || (href && href.startsWith('http') ? '_blank' : null)"
           rel="noopener"
           [attr.aria-label]="actionLabel"
        >{{ actionLabel }}</a>
      </div>
    </article>
  `,
})
export class CardComponent {
  @Input() imageUrl?: string | null;
  @Input() imageAlt?: string | null;
  @Input() title?: string | null;
  @Input() description?: string | null;
  @Input() tags: string[] | null = null;
  @Input() size: CardSize = 'medium';
  @Input() actionLabel?: string | null;
  @Input() href?: string | null;
  @Input() target?: string | null;

  @Output() action = new EventEmitter<void>();
}

