import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-info-modal',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="fixed inset-0 z-50 flex items-center justify-center" 
         *ngIf="open"
         role="dialog"
         aria-modal="true"
         [attr.aria-labelledby]="'modal-title-' + modalId"
         [attr.aria-describedby]="'modal-content-' + modalId">
      
      <!-- Overlay de fondo -->
      <div class="absolute inset-0 bg-black/50" 
           (click)="close.emit()"
           aria-hidden="true"></div>
      
      <!-- Contenido del modal -->
      <div class="relative z-10 max-w-lg w-[90%] bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6"
           role="document"
           (click)="$event.stopPropagation()">
        
        <!-- Header del modal -->
        <div class="flex items-center justify-between mb-4">
          <h2 [id]="'modal-title-' + modalId" class="text-lg font-semibold text-gray-900 dark:text-white">
            Información
          </h2>
          
          <!-- Botón de cerrar -->
          <button type="button" 
                  class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors duration-200 p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
                  (click)="close.emit()"
                  aria-label="Cerrar modal de información">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>
        </div>
        
        <!-- Contenido del modal -->
        <div [id]="'modal-content-' + modalId" 
             class="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-line mb-6"
             role="textbox"
             aria-label="Contenido de la información">
          {{ content }}
        </div>
        
        <!-- Botón de acción -->
        <div class="flex justify-end">
          <button type="button" 
                  class="btn bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                  (click)="close.emit()"
                  aria-label="Cerrar modal">
            Cerrar
          </button>
        </div>
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InfoModalComponent {
  @Input() content = '';
  @Input() open = false;
  @Output() close = new EventEmitter<void>();
  
  // ID único para el modal para evitar conflictos de accesibilidad
  protected modalId = Math.random().toString(36).substr(2, 9);

  // Manejar la tecla Escape para cerrar el modal
  @HostListener('document:keydown.escape')
  onEscapeKey(): void {
    if (this.open) {
      this.close.emit();
    }
  }

  // Manejar la tecla Tab para mantener el foco dentro del modal
  @HostListener('document:keydown.tab', ['$event'])
  onTabKey(event: Event): void {
    if (!this.open) return;
    
    const keyboardEvent = event as KeyboardEvent;
    const modalElement = event.target as HTMLElement;
    const focusableElements = modalElement.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    
    const firstElement = focusableElements[0] as HTMLElement;
    const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;
    
    if (keyboardEvent.shiftKey) {
      if (document.activeElement === firstElement) {
        event.preventDefault();
        lastElement.focus();
      }
    } else {
      if (document.activeElement === lastElement) {
        event.preventDefault();
        firstElement.focus();
      }
    }
  }
}


