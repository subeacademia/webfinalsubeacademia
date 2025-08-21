import { Component, Input, HostBinding } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
	selector: 'app-value-proposition-card',
	standalone: true,
	imports: [CommonModule],
	templateUrl: './value-proposition-card.component.html',
	styleUrls: ['./value-proposition-card.component.css']
})
export class ValuePropositionCardComponent {
	@Input() title!: string;
	@Input() shortDescription!: string;
	@Input() detailedDescription!: string;
	@Input() icon!: 'user-gear' | 'rocket-launch' | 'diamond';

	@HostBinding('class') get classes() {
		return 'value-card-perspective';
	}
}


