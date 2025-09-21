import { Component, Input, WritableSignal, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HeroSceneComponent } from '../../../features/home/hero-scene/hero-scene.component';
import { TechLinesSceneComponent } from '../../../features/home/tech-lines-scene/tech-lines-scene.component';
import { ElegantNetworkSceneComponent } from '../../../features/home/elegant-network-scene/elegant-network-scene.component';
import { AiNeuralFlowSceneComponent } from '../../../features/home/ai-neural-flow-scene/ai-neural-flow-scene.component';
import { NeuralNetworkBackgroundV2Component } from '../../../features/home/circuit-neural-background/neural-network-background-v2.component';
import { LocalSettingsService, LocalSiteSettings } from '../../../core/services/local-settings.service';

@Component({
  selector: 'app-page-header',
  standalone: true,
  imports: [
    CommonModule,
    // Fondos 3D disponibles
    HeroSceneComponent,
    TechLinesSceneComponent,
    ElegantNetworkSceneComponent,
    AiNeuralFlowSceneComponent,
    NeuralNetworkBackgroundV2Component,
  ],
  templateUrl: './page-header.html',
  styleUrls: ['./page-header.css']
})
export class PageHeaderComponent {
  @Input() title: string = '';
  @Input() subtitle: string = '';
  selectedHomeBgKey: WritableSignal<string> = signal('neural-3d-v1');

  constructor(private readonly localSettings: LocalSettingsService) {
    // Escuchar el setting local para fondo
    this.localSettings.get().subscribe((s: LocalSiteSettings) => {
      if (s?.homeBackgroundKey) {
        this.selectedHomeBgKey.set(s.homeBackgroundKey);
      }
    });
  }
}
