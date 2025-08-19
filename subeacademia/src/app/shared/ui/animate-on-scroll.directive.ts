import { Directive, ElementRef, AfterViewInit, Input, OnDestroy } from '@angular/core';
import { AnimationService } from '../../core/services/animation.service';

@Directive({
  selector: '[appAnimateOnScroll]',
  standalone: true,
})
export class AnimateOnScrollDirective implements AfterViewInit, OnDestroy {
  @Input('appAnimateOnScroll') animationTargetSelector!: string;
  private observer!: IntersectionObserver;

  constructor(
    private el: ElementRef,
    private animationService: AnimationService // Inyectamos el servicio
  ) {}

  ngAfterViewInit(): void {
    const options = { threshold: 0.2 };
    this.observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const targets = this.el.nativeElement.querySelectorAll(this.animationTargetSelector);
          if (targets.length > 0) {
            // Ocultamos y luego animamos usando el servicio
            targets.forEach((target: HTMLElement) => target.style.opacity = '0');
            this.animationService.staggerFromBottom(targets);
          }
          this.observer.unobserve(this.el.nativeElement);
        }
      });
    }, options);
    this.observer.observe(this.el.nativeElement);
  }

  ngOnDestroy(): void {
    if (this.observer) {
      this.observer.disconnect();
    }
  }
}
