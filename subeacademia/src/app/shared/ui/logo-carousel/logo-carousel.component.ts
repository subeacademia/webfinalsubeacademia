import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Logo } from '../../../core/models/logo.model';

@Component({
  selector: 'app-logo-carousel',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="logo-carousel-container">
      <div class="logo-carousel-track" [class.reverse]="direction === 'reverse'">
        <div class="logo-item" *ngFor="let logo of logos">
          <img [src]="logo.imageUrl" [alt]="logo.name" class="logo-image">
        </div>
        <div class="logo-item" *ngFor="let logo of logos">
          <img [src]="logo.imageUrl" [alt]="logo.name" class="logo-image">
        </div>
      </div>
    </div>
  `,
  styleUrls: ['./logo-carousel.component.css']
})
export class LogoCarouselComponent {
  @Input() logos: Logo[] = [];
  @Input() direction: 'normal' | 'reverse' = 'normal';
}
