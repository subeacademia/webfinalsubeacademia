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
  @Input() variant: 'primary' | 'secondary' | 'ghost' | 'success' | 'warning' | 'purple' | 'pink' | 'cyan' = 'primary';
  @Input() size: 'sm' | 'md' | 'lg' = 'md';
  @Input() disabled: boolean = false;
  @Input() type: 'button' | 'submit' | 'reset' = 'button';
  @Output() clicked = new EventEmitter<void>();

  get buttonClasses(): string {
    const baseClasses = 'colorful-button inline-flex items-center justify-center font-bold rounded-2xl transition-all duration-300 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 hover:-translate-y-1 shadow-lg hover:shadow-xl whitespace-normal break-words text-center gap-2';
    
    const variantClasses = {
      primary: 'bg-gradient-to-r from-blue-500 via-blue-600 to-indigo-600 hover:from-blue-600 hover:via-blue-700 hover:to-indigo-700 text-white border-0 shadow-blue-500/30 hover:shadow-blue-600/40',
      secondary: 'bg-gradient-to-r from-slate-500 via-slate-600 to-gray-600 hover:from-slate-600 hover:via-slate-700 hover:to-gray-700 text-white border-0 shadow-slate-500/30',
      ghost: 'bg-gradient-to-r from-white/10 via-white/15 to-white/20 hover:from-white/20 hover:via-white/25 hover:to-white/30 text-white border-2 border-white/30 hover:border-white/50 backdrop-blur-md shadow-white/20',
      success: 'bg-gradient-to-r from-emerald-500 via-green-600 to-teal-600 hover:from-emerald-600 hover:via-green-700 hover:to-teal-700 text-white border-0 shadow-emerald-500/30 hover:shadow-green-600/40',
      warning: 'bg-gradient-to-r from-orange-500 via-amber-600 to-yellow-600 hover:from-orange-600 hover:via-amber-700 hover:to-yellow-700 text-white border-0 shadow-orange-500/30 hover:shadow-amber-600/40',
      purple: 'bg-gradient-to-r from-purple-500 via-violet-600 to-purple-600 hover:from-purple-600 hover:via-violet-700 hover:to-purple-700 text-white border-0 shadow-purple-500/30 hover:shadow-violet-600/40',
      pink: 'bg-gradient-to-r from-pink-500 via-rose-600 to-pink-600 hover:from-pink-600 hover:via-rose-700 hover:to-pink-700 text-white border-0 shadow-pink-500/30 hover:shadow-rose-600/40',
      cyan: 'bg-gradient-to-r from-cyan-500 via-blue-600 to-cyan-600 hover:from-cyan-600 hover:via-blue-700 hover:to-cyan-700 text-white border-0 shadow-cyan-500/30 hover:shadow-blue-600/40'
    } as const;
    
    const sizeClasses = {
      sm: 'px-4 py-2 text-sm min-h-[2.5rem]',
      md: 'px-6 py-3 text-base min-h-[3rem]',
      lg: 'px-8 py-4 text-lg min-h-[3.5rem] max-w-full'
    };
    
    return `${baseClasses} ${variantClasses[this.variant]} ${sizeClasses[this.size]}`;
  }

  onClick(): void {
    if (!this.disabled) {
      this.clicked.emit();
    }
  }
}
