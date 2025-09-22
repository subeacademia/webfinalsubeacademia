import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-social-share-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 transition-opacity duration-200" (click)="closeModal()">
      <div class="bg-[var(--panel)] border border-[var(--border)] rounded-2xl p-8 max-w-sm w-full mx-4 transform transition-all duration-200 ease-out animate-in max-h-[80vh] overflow-y-auto" (click)="$event.stopPropagation()" [ngClass]="{ 'scale-100 opacity-100': isOpen, 'scale-95 opacity-0': !isOpen }">
        <div class="text-center">
          <h3 class="text-2xl font-bold text-[var(--fg)] mb-4">
            Compartir Resultados
          </h3>
          <p class="text-[var(--muted)] mb-8">
            Selecciona las redes sociales donde quieres compartir tus resultados del diagnóstico de IA
          </p>
          
          <div class="space-y-4 mb-8">
            <!-- LinkedIn -->
            <label class="flex items-center space-x-3 cursor-pointer">
              <input type="checkbox" [(ngModel)]="selectedPlatforms.linkedin" class="w-5 h-5 text-blue-600">
              <span class="text-[var(--fg)]">LinkedIn</span>
            </label>
            <!-- Facebook -->
            <label class="flex items-center space-x-3 cursor-pointer">
              <input type="checkbox" [(ngModel)]="selectedPlatforms.facebook" class="w-5 h-5 text-blue-600">
              <span class="text-[var(--fg)]">Facebook</span>
            </label>
            <!-- Compartir del dispositivo -->
            <label class="flex items-center space-x-3 cursor-pointer">
              <input type="checkbox" [(ngModel)]="selectedPlatforms.device" class="w-5 h-5 text-blue-600">
              <span class="text-[var(--fg)]">Compartir del dispositivo</span>
            </label>
          </div>
          
          <div class="flex space-x-4">
            <button 
              (click)="shareResults()"
              [disabled]="!hasSelectedPlatforms()"
              class="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200">
              Compartir
            </button>
            <button 
              (click)="copyLink()"
              class="flex-1 bg-[var(--card)] hover:bg-[color-mix(in_srgb,_var(--card),_var(--fg)_10%)] text-[var(--fg)] font-semibold py-3 px-6 rounded-lg transition-colors duration-200">
              {{ copied ? '¡Enlace copiado!' : 'Copiar enlace' }}
            </button>
            <button 
              (click)="closeModal()"
              class="flex-1 bg-[var(--card)] hover:bg-[color-mix(in_srgb,_var(--card),_var(--fg)_10%)] text-[var(--fg)] font-semibold py-3 px-6 rounded-lg transition-colors duration-200">
              Cancelar
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
    }
    .animate-in { opacity: 0; transform: scale(0.98); }
    :host-context(app-social-share-modal[ng-reflect-is-open="true"]) .animate-in { opacity: 1; transform: none; }
  `]
})
export class SocialShareModalComponent {
  @Input() isOpen = false;
  @Output() close = new EventEmitter<void>();
  @Output() share = new EventEmitter<string[]>();

  selectedPlatforms = {
    linkedin: false,
    facebook: false,
    device: true
  };

  copied = false;

  hasSelectedPlatforms(): boolean {
    return Object.values(this.selectedPlatforms).some(selected => selected);
  }

  closeModal(): void {
    this.close.emit();
  }

  shareResults(): void {
    const selectedPlatforms = Object.entries(this.selectedPlatforms)
      .filter(([_, selected]) => selected)
      .map(([platform, _]) => platform);
    
    this.share.emit(selectedPlatforms);
    this.closeModal();
  }

  copyLink(): void {
    const url = window.location.href;
    navigator.clipboard.writeText(url).then(() => {
      this.copied = true;
      setTimeout(() => (this.copied = false), 1500);
    }).catch(() => {
      // Fallback
      const input = document.createElement('input');
      input.value = url;
      document.body.appendChild(input);
      input.select();
      document.execCommand('copy');
      document.body.removeChild(input);
      this.copied = true;
      setTimeout(() => (this.copied = false), 1500);
    });
  }
}
