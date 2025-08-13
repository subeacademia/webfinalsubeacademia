import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { I18nTranslatePipe } from '../../core/i18n/i18n.pipe';
import { PageHeaderComponent } from '../../shared/ui/page-header/page-header';

@Component({
  selector: 'app-methodology',
  standalone: true,
  imports: [CommonModule, I18nTranslatePipe, PageHeaderComponent],
  templateUrl: './methodology.component.html',
})
export class MethodologyComponent {
  competencies = Array.from({ length: 13 }, (_, i) => i + 1);
}


