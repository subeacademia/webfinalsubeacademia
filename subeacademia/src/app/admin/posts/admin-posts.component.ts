import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-admin-posts',
  standalone: true,
  template: `
    <h1 class="text-2xl font-semibold">Admin · Posts</h1>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminPostsComponent {}

