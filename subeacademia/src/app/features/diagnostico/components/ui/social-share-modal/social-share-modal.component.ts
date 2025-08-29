import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { I18nTranslatePipe } from '../../../../../core/i18n/i18n.pipe';

@Component({
  selector: 'app-social-share-modal',
  standalone: true,
  imports: [CommonModule, FormsModule, I18nTranslatePipe],
  template: `
    <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 transition-opacity duration-200" (click)="closeModal()">
      <div class="bg-[var(--panel)] rounded-2xl p-8 max-w-md w-full mx-4 transform transition-all duration-200 ease-out animate-in border border-[var(--border)]" (click)="$event.stopPropagation()" [ngClass]="{ 'scale-100 opacity-100': isOpen, 'scale-95 opacity-0': !isOpen }">
        <div class="text-center">
          <h3 class="text-2xl font-bold text-[var(--fg)] mb-4">
            {{ 'diagnostico.share.title' | i18nTranslate }}
          </h3>
          <p class="text-[var(--muted)] mb-8">
            {{ 'diagnostico.share.subtitle' | i18nTranslate }}
          </p>
          
          <div class="space-y-4 mb-8">
            <!-- LinkedIn -->
            <label class="flex items-center space-x-3 cursor-pointer">
              <input type="checkbox" [(ngModel)]="selectedPlatforms.linkedin" class="w-5 h-5 text-blue-600">
              <div class="flex items-center space-x-3">
                <svg class="w-6 h-6 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                </svg>
                <span class="text-[var(--fg)]/80">LinkedIn</span>
              </div>
            </label>
            
            <!-- Instagram -->
            <label class="flex items-center space-x-3 cursor-pointer">
              <input type="checkbox" [(ngModel)]="selectedPlatforms.instagram" class="w-5 h-5 text-pink-600">
              <div class="flex items-center space-x-3">
                <svg class="w-6 h-6 text-pink-600" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 6.62 5.367 11.987 11.988 11.987 6.62 0 11.987-5.367 11.987-11.987C24.014 5.367 18.637.001 12.017.001zM8.449 16.988c-1.297 0-2.448-.49-3.323-1.297C4.198 14.895 3.708 13.744 3.708 12.447s.49-2.448 1.297-3.323c.875-.807 2.026-1.297 3.323-1.297s2.448.49 3.323 1.297c.807.875 1.297 2.026 1.297 3.323s-.49 2.448-1.297 3.323c-.875.807-2.026 1.297-3.323 1.297zm7.718-1.297c-.875.807-2.026 1.297-3.323 1.297s-2.448-.49-3.323-1.297c-.807-.875-1.297-2.026-1.297-3.323s.49-2.448 1.297-3.323c.875-.807 2.026-1.297 3.323-1.297s2.448.49 3.323 1.297c.807.875 1.297 2.026 1.297 3.323s-.49 2.448-1.297 3.323z"/>
                </svg>
                <span class="text-[var(--fg)]/80">Instagram</span>
              </div>
            </label>
            
            <!-- Facebook -->
            <label class="flex items-center space-x-3 cursor-pointer">
              <input type="checkbox" [(ngModel)]="selectedPlatforms.facebook" class="w-5 h-5 text-blue-600">
              <div class="flex items-center space-x-3">
                <svg class="w-6 h-6 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
                <span class="text-[var(--fg)]/80">Facebook</span>
              </div>
            </label>
            
            <!-- TikTok -->
            <label class="flex items-center space-x-3 cursor-pointer">
              <input type="checkbox" [(ngModel)]="selectedPlatforms.tiktok" class="w-5 h-5 text-black dark:text-white">
              <div class="flex items-center space-x-3">
                <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-.9-.40-1.71-.95-2.27-.32-.32-.7-.49-1.13-.49-.37 0-.74.16-1.03.42-.63.69-.88 1.61-.84 2.56.05 1.42 1.2 2.69 2.58 2.76 1.38.07 2.68-.67 3.31-1.85.31-.58.49-1.24.54-1.89.05-.67-.01-1.35-.18-2.01-.17-.66-.47-1.28-.87-1.84-.4-.56-.89-1.03-1.44-1.42-.55-.39-1.16-.68-1.8-.87-.64-.19-1.31-.28-1.98-.28-.67 0-1.34.09-1.98.28-.64.19-1.25.48-1.8.87-.55.39-1.04.86-1.44 1.42-.4.56-.7 1.18-.87 1.84-.17.66-.23 1.34-.18 2.01.05.65.23 1.31.54 1.89.63 1.18 1.93 1.92 3.31 1.85 1.38-.07 2.53-1.34 2.58-2.76.04-.95-.21-1.87-.84-2.56-.29-.26-.66-.42-1.03-.42-.43 0-.81.17-1.13.49-.55.56-1.05 1.37-.95 2.27.01.39.22.73.41 1.06.58.95 1.65 1.6 2.77 1.61 1.68-.15 3.26-1.23 3.5-2.87.01-.54.07-1.1-.14-1.61-.25-.71-.73-1.34-1.36-1.75-.87-.6-2.03-.69-3.02-.37.01-1.48-.06-2.96-.04-4.44 2.17-.41 4.49.28 6.15 1.72 1.46 1.24 2.4 3.06 2.58 4.96.02.49.01.99-.01 1.49-.21 2.34-1.63 4.52-3.65 5.71-1.22.72-2.65 1.11-4.08 1.03-2.33-.04-4.6-1.29-5.91-3.21-.81-1.15-1.27-2.54-1.35-3.94-.03-2.91-.01-5.83-.02-8.75-.52.34-1.05.67-1.62.93-1.31.62-2.76.92-4.2.97V6.09c1.54-.17 3.12-.68 4.24-1.79 1.12-1.08 1.67-2.64 1.75-4.17z"/>
                </svg>
                <span class="text-[var(--fg)]/80">TikTok</span>
              </div>
            </label>
          </div>
          
          <div class="flex space-x-4">
            <button 
              (click)="shareResults()"
              [disabled]="!hasSelectedPlatforms()"
              class="flex-1 bg-[var(--primary)] hover:[background:color-mix(in_srgb,_var(--primary),_black_10%)] disabled:opacity-50 text-[var(--primary-contrast)] font-semibold py-3 px-6 rounded-lg transition-colors duration-200">
              {{ 'diagnostico.share.share' | i18nTranslate }}
            </button>
            <button 
              (click)="copyLink()"
              class="flex-1 bg-[var(--card)] hover:bg-[color-mix(in_srgb,_var(--card),_var(--fg)_10%)] text-[var(--fg)] font-semibold py-3 px-6 rounded-lg transition-colors duration-200 border border-[var(--border)]">
              {{ (copied ? 'diagnostico.share.copied' : 'diagnostico.share.copy') | i18nTranslate }}
            </button>
            <button 
              (click)="closeModal()"
              class="flex-1 bg-[var(--card)] hover:bg-[color-mix(in_srgb,_var(--panel),_var(--fg)_10%)] text-[var(--fg)] font-semibold py-3 px-6 rounded-lg transition-colors duration-200 border border-[var(--border)]">
              {{ 'shared.cancel' | i18nTranslate }}
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
    instagram: false,
    facebook: false,
    tiktok: false
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
