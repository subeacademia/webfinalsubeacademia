import { Injectable } from '@angular/core';
import { animate, stagger, createTimeline } from 'animejs';

@Injectable({
  providedIn: 'root'
})
export class AnimationService {

  constructor() { }

  /**
   * Anima un grupo de elementos para que aparezcan desde abajo de forma escalonada.
   * Ideal para listas de tarjetas o elementos que deben aparecer en secuencia.
   * @param targets El selector de CSS o los elementos del DOM a animar.
   */
  staggerFromBottom(targets: any): void {
    animate(targets, {
      translateY: [30, 0],
      opacity: [0, 1],
      delay: stagger(150),
      duration: 900,
      easing: 'easeOutExpo',
    });
  }

  /**
   * Anima un texto para que aparezca letra por letra.
   * @param targets El selector del contenedor del texto.
   */
  textReveal(targets: string): void {
    const textWrapper = document.querySelector(targets);
    if (textWrapper) {
      textWrapper.innerHTML = textWrapper.textContent!.replace(/\S/g, "<span class='letter'>$&</span>");
      createTimeline({ loop: false })
        .add(`${targets} .letter`, {
          translateY: [-100, 0],
          opacity: [0, 1],
          easing: "easeOutExpo",
          duration: 1400,
          delay: (el: any, i: number) => 30 * i
        });
    }
  }

  /**
   * Anima un número para que cuente desde 0 hasta un valor final.
   * @param targets El selector del elemento que contiene el número.
   * @param endValue El valor final al que debe llegar el contador.
   */
  countUp(targets: string, endValue: number): void {
    const targetElement = document.querySelector(targets);
    if (targetElement) {
        let counter = { value: 0 };
        animate(counter, {
            value: endValue,
            round: 1,
            easing: 'easeInOutQuad',
            duration: 2000,
            update: function() {
                (targetElement as HTMLElement).innerHTML = counter.value.toString();
            }
        });
    }
  }
}
