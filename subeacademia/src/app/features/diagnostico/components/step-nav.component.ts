import { ChangeDetectionStrategy, Component, Input, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';

@Component({
	selector: 'app-step-nav',
	standalone: true,
	imports: [CommonModule],
	template: `
		<div class="mt-6 flex items-center justify-between gap-4">
			<button type="button" class="btn" [disabled]="!prev" (click)="go(prev!)">Anterior</button>
			<div class="flex-1"></div>
			<button type="button" class="btn btn-primary" [disabled]="!next || nextDisabled" (click)="go(next!)">Siguiente</button>
		</div>
	`,
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StepNavComponent {
	@Input() prev: string | null = null;
	@Input() next: string | null = null;
	@Input() nextDisabled: boolean | null = false;

	private readonly router = inject(Router);
	private readonly route = inject(ActivatedRoute);

	go(segment: string): void {
		const parent = this.route.parent;
		if (parent) {
			this.router.navigate([segment], { relativeTo: parent });
		}
	}
}


