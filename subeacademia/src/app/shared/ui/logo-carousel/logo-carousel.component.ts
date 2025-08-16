import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Logo } from '../../../core/models/logo.model';

@Component({
  selector: 'app-logo-carousel',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './logo-carousel.component.html',
  styleUrls: ['./logo-carousel.component.css']
})
export class LogoCarouselComponent implements OnChanges {
  @Input() logos: Logo[] = [];
  @Input() direction: 'normal' | 'reverse' = 'normal';

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['logos'] && this.logos.length > 0) {
      console.log('LogoCarousel: Logos recibidos:', this.logos.length, this.logos);
    }
  }
}
