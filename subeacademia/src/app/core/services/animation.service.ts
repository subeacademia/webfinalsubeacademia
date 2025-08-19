import { Injectable } from '@angular/core';
import anime from 'animejs/lib/anime.es.js';

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
  staggerFromBottom(targets: anime.AnimeParams['targets']): void {
    anime({
      targets: targets,
      translateY: [30, 0],
      opacity: [0, 1],
      delay: anime.stagger(150),
      duration: 900,
      easing: 'easeOutExpo',
    });
  }

  /**
   * Anima un texto para que aparezca letra por letra.
   * @param targets El selector del contenedor del texto.
   */
  textReveal(targets: anime.AnimeParams['targets']): void {
    const textWrapper = document.querySelector(targets as string);
    if (textWrapper) {
      textWrapper.innerHTML = textWrapper.textContent!.replace(/\S/g, "<span class='letter'>$&</span>");
      anime.timeline({ loop: false })
        .add({
          targets: `${targets} .letter`,
          translateY: [-100, 0],
          opacity: [0, 1],
          easing: "easeOutExpo",
          duration: 1400,
          delay: (el, i) => 30 * i
        });
    }
  }

  /**
   * Anima un número para que cuente desde 0 hasta un valor final.
   * @param targets El selector del elemento que contiene el número.
   * @param endValue El valor final al que debe llegar el contador.
   */
  countUp(targets: anime.AnimeParams['targets'], endValue: number): void {
    const targetElement = document.querySelector(targets as string);
    if (targetElement) {
        let counter = { value: 0 };
        anime({
            targets: counter,
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
