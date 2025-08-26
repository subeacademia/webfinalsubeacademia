import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-ui-button',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './button.html',
  styleUrl: './button.css'
})
export class UiButtonComponent {
  @Input() variant: 'primary' | 'secondary' | 'ghost' = 'primary';
  @Input() size: 'sm' | 'md' | 'lg' = 'md';
  @Input() disabled: boolean = false;
  @Input() type: 'button' | 'submit' | 'reset' = 'button';
  @Output() clicked = new EventEmitter<void>();

  get buttonClasses(): string {
    const baseClasses = 'inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';
    
    const variantClasses = {
      primary: 'bg-[var(--primary)] text-[var(--primary-contrast)] hover:[background:color-mix(in_srgb,_var(--primary),_black_10%)] focus:ring-[var(--primary)]',
      secondary: 'bg-[var(--card)] text-[var(--fg)] hover:bg-[color-mix(in_srgb,_var(--card),_var(--fg)_10%)] border border-[var(--border)] focus:ring-[var(--accent)]',
      ghost: 'bg-transparent text-[var(--fg)] hover:bg-[color-mix(in_srgb,_var(--panel),_var(--fg)_8%)] border border-[var(--border)] focus:ring-[var(--accent)]'
    } as const;
    
    const sizeClasses = {
      sm: 'px-3 py-1.5 text-sm',
      md: 'px-4 py-2 text-base',
      lg: 'px-6 py-3 text-lg'
    };
    
    return `${baseClasses} ${variantClasses[this.variant]} ${sizeClasses[this.size]}`;
  }

  onClick(): void {
    if (!this.disabled) {
      this.clicked.emit();
    }
  }
}
