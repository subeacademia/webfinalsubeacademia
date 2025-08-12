import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { HeroSceneComponent } from '../../features/home/hero-scene/hero-scene.component';
import { I18nService } from '../../core/i18n/i18n.service';
import { I18nTranslatePipe } from '../../core/i18n/i18n.pipe';

@Component({
  standalone: true,
  selector: 'app-home',
  imports: [RouterModule, HeroSceneComponent, I18nTranslatePipe],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent {
  constructor(public readonly i18n: I18nService) {}
}

