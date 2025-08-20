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

  /**
   * Anima la aparición de un elemento con un efecto de fade y scale.
   * @param targets El selector del elemento a animar.
   * @param delay Delay antes de iniciar la animación.
   */
  fadeInScale(targets: string, delay: number = 0): void {
    const targetElement = document.querySelector(targets);
    if (targetElement) {
      (targetElement as HTMLElement).style.opacity = '0';
      (targetElement as HTMLElement).style.transform = 'scale(0.8)';
      
      setTimeout(() => {
        animate(targetElement, {
          opacity: [0, 1],
          scale: [0.8, 1],
          duration: 800,
          easing: 'easeOutExpo',
        });
      }, delay);
    }
  }

  /**
   * Anima un gráfico para que se "dibuje" desde cero.
   * @param chartData Los datos del gráfico a animar.
   * @param duration Duración de la animación en milisegundos.
   */
  animateChartData(chartData: any, duration: number = 2000): void {
    if (!chartData || !chartData.datasets || !chartData.datasets[0]) return;

    const dataset = chartData.datasets[0];
    const finalData = [...dataset.data];
    
    // Inicializar en cero
    dataset.data = new Array(finalData.length).fill(0);
    
    // Animar cada valor
    finalData.forEach((finalValue: number, index: number) => {
      setTimeout(() => {
        animate({ value: 0 }, {
          value: finalValue,
          duration: duration,
          easing: 'easeInOutExpo',
          round: 1,
          update: (anim: any) => {
            dataset.data[index] = anim.animations[0].currentValue;
            // Forzar actualización del gráfico
            if (chartData.update) {
              chartData.update();
            }
          }
        });
      }, index * 200); // Stagger de 200ms entre cada valor
    });
  }

  /**
   * Anima la aparición de elementos en secuencia con un efecto de cascada.
   * @param targets Array de selectores o elementos a animar.
   * @param staggerDelay Delay entre cada elemento.
   */
  cascadeIn(targets: string[], staggerDelay: number = 100): void {
    targets.forEach((target, index) => {
      const element = document.querySelector(target);
      if (element) {
        (element as HTMLElement).style.opacity = '0';
        (element as HTMLElement).style.transform = 'translateY(20px)';
        
        setTimeout(() => {
          animate(element, {
            opacity: [0, 1],
            translateY: [20, 0],
            duration: 600,
            easing: 'easeOutExpo',
          });
        }, index * staggerDelay);
      }
    });
  }

  /**
   * Anima un elemento para que pulse suavemente.
   * @param targets El selector del elemento a animar.
   * @param iterations Número de veces que debe pulsar.
   */
  pulse(targets: string, iterations: number = 3): void {
    const targetElement = document.querySelector(targets);
    if (targetElement) {
      animate(targetElement, {
        scale: [1, 1.05, 1],
        duration: 600,
        easing: 'easeInOutQuad',
        loop: iterations,
      });
    }
  }

  /**
   * Anima un elemento para que se deslice desde la izquierda.
   * @param targets El selector del elemento a animar.
   * @param delay Delay antes de iniciar la animación.
   */
  slideInFromLeft(targets: string, delay: number = 0): void {
    const targetElement = document.querySelector(targets);
    if (targetElement) {
      (targetElement as HTMLElement).style.opacity = '0';
      (targetElement as HTMLElement).style.transform = 'translateX(-50px)';
      
      setTimeout(() => {
        animate(targetElement, {
          opacity: [0, 1],
          translateX: [-50, 0],
          duration: 800,
          easing: 'easeOutExpo',
        });
      }, delay);
    }
  }

  /**
   * Anima un elemento para que se deslice desde la derecha.
   * @param targets El selector del elemento a animar.
   * @param delay Delay antes de iniciar la animación.
   */
  slideInFromRight(targets: string, delay: number = 0): void {
    const targetElement = document.querySelector(targets);
    if (targetElement) {
      (targetElement as HTMLElement).style.opacity = '0';
      (targetElement as HTMLElement).style.transform = 'translateX(50px)';
      
      setTimeout(() => {
        animate(targetElement, {
          opacity: [0, 1],
          translateX: [50, 0],
          duration: 800,
          easing: 'easeOutExpo',
        });
      }, delay);
    }
  }
}
