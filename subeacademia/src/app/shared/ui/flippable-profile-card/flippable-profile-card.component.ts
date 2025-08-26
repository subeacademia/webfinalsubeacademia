import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { I18nTranslatePipe } from '../../../core/i18n/i18n.pipe';

@Component({
  selector: 'app-flippable-profile-card',
  standalone: true,
  imports: [CommonModule, I18nTranslatePipe],
  templateUrl: './flippable-profile-card.component.html',
  styleUrls: ['./flippable-profile-card.component.css']
})
export class FlippableProfileCardComponent {
  @Input() name = '';
  @Input() imageUrl = '';
  @Input() subtitle = '';
  @Input() description = '';
  flipped = false;

  toggle(){ this.flipped = !this.flipped; }
}


