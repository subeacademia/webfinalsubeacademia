import { AfterViewInit, Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import * as animeImport from 'animejs';
const anime = (animeImport as any).default ?? (animeImport as any);
import { HistoryService } from '../../../../core/data/history.service';
import { HistoryEvent } from '../../../../core/models/history-event.model';
import { Observable, map } from 'rxjs';

@Component({
  selector: 'app-history-timeline',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './history-timeline.component.html',
  styleUrls: ['./history-timeline.component.css']
})
export class HistoryTimelineComponent implements AfterViewInit {
  private svc = inject(HistoryService);
  events$!: Observable<HistoryEvent[]>;

  constructor(){
    const fallback: HistoryEvent[] = [
      { year: 2022, title: 'Génesis', description: 'Nacimiento de la idea y desarrollo del primer prototipo del diagnóstico de madurez en IA, sentando las bases de nuestra metodología.' },
      { year: 2023, title: 'Lanzamiento', description: 'Lanzamiento oficial de la plataforma Sube-Academia y los primeros programas de formación, validando nuestro enfoque en el mercado.' },
      { year: 2024, title: 'Consolidación', description: 'Establecimiento de alianzas estratégicas clave y expansión de nuestro portafolio de certificaciones y asesorías personalizadas.' },
      { year: 2025, title: 'Expansión', description: 'Inicio de operaciones a nivel LATAM y desarrollo de soluciones de IA para optimizar la personalización del aprendizaje a gran escala.' },
    ];
    this.events$ = this.svc.list().pipe(map(list => list && list.length ? list : fallback));
  }

  ngAfterViewInit(): void {
    const timelineItems = document.querySelectorAll('.timeline-item-container');
    if (!timelineItems || timelineItems.length === 0) return;
    const io = new IntersectionObserver((entries) => {
      const anyVisible = entries.some(e => e.isIntersecting);
      if (!anyVisible) return;
      anime({
        targets: timelineItems,
        translateY: [40, 0],
        opacity: [0, 1],
        easing: 'easeOutQuad',
        delay: anime.stagger(200, { start: 150 })
      });
      io.disconnect();
    }, { threshold: 0.05 });
    const container = document.querySelector('.timeline-container');
    if (container) io.observe(container);
  }
}


