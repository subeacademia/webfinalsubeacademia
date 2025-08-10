import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-admin-courses',
  standalone: true,
  template: `
    <h1 class="text-2xl font-semibold">Admin · Courses</h1>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminCoursesComponent {}

