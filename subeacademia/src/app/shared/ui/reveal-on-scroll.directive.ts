import { Directive, ElementRef, Inject, Input, OnDestroy, OnInit, PLATFORM_ID, Renderer2 } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

type RevealVariant = 'up' | 'down' | 'left' | 'right' | 'fade';

@Directive({
  selector: '[revealOnScroll]',
  standalone: true,
})
export class RevealOnScrollDirective implements OnInit, OnDestroy {
  @Input('revealOnScroll') variant: RevealVariant = 'up';
  @Input() revealDelay: number | string | null = null; // ms
  @Input() revealOnce = true;

  private io?: IntersectionObserver;
  private readonly isBrowser: boolean;

  constructor(
    private readonly el: ElementRef<HTMLElement>,
    private readonly renderer: Renderer2,
    @Inject(PLATFORM_ID) platformId: Object,
  ) {
    this.isBrowser = isPlatformBrowser(platformId);
  }

  ngOnInit(): void {
    const node = this.el.nativeElement;
    // Estado inicial
    this.renderer.addClass(node, 'reveal');
    this.renderer.addClass(node, `reveal-${this.variant}`);
    if (this.revealDelay != null) {
      const delayVal = typeof this.revealDelay === 'number' ? `${this.revealDelay}ms` : this.revealDelay;
      this.renderer.setStyle(node, '--reveal-delay', delayVal);
    }

    if (!this.isBrowser) return;

    this.io = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          this.renderer.addClass(node, 'is-visible');
          if (this.revealOnce) {
            this.disconnect();
          }
        } else if (!this.revealOnce) {
          this.renderer.removeClass(node, 'is-visible');
        }
      }
    }, { threshold: 0.12, rootMargin: '0px 0px -10% 0px' });

    this.io.observe(node);
  }

  ngOnDestroy(): void {
    this.disconnect();
  }

  private disconnect() {
    if (this.io) {
      this.io.disconnect();
      this.io = undefined;
    }
  }
}

