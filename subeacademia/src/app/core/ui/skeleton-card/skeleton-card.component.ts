import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-skeleton-card',
  standalone: true,
  template: `
    <div class="card p-4">
      <div class="h-36 w-full rounded-xl skeleton"></div>
      <div class="mt-4 h-4 w-3/4 rounded skeleton"></div>
      <div class="mt-2 h-4 w-1/2 rounded skeleton"></div>
    </div>
  `,
})
export class SkeletonCardComponent {}

