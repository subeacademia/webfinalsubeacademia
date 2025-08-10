import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-skeleton-card',
  standalone: true,
  template: `
    <div class="rounded-2xl border border-white/10 bg-white/5 p-4 animate-pulse">
      <div class="h-36 w-full rounded-xl bg-white/10"></div>
      <div class="mt-4 h-4 w-3/4 rounded bg-white/10"></div>
      <div class="mt-2 h-4 w-1/2 rounded bg-white/10"></div>
    </div>
  `,
})
export class SkeletonCardComponent {}

