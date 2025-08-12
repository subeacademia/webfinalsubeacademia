import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HeroSceneComponent } from '../../../features/home/hero-scene/hero-scene.component';

@Component({
  selector: 'app-page-header',
  standalone: true,
  imports: [CommonModule, HeroSceneComponent],
  templateUrl: './page-header.html',
  styleUrls: ['./page-header.css']
})
export class PageHeaderComponent {
  @Input() title: string = '';
  @Input() subtitle: string = '';
}
