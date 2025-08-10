import { Component, forwardRef } from '@angular/core';
import { NG_VALUE_ACCESSOR } from '@angular/forms';

@Component({
  selector: 'app-rich-editor',
  standalone: true,
  template: `
    <textarea class="w-full min-h-64 h-64 ui-input" [value]="value" (input)="onInput($event)"></textarea>
  `,
  providers: [
    { provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => RichEditorComponent), multi: true }
  ]
})
export class RichEditorComponent {
  value = '';

  onInput(e: Event) {
    const v = (e.target as HTMLTextAreaElement)?.value ?? '';
    this.value = v;
    this._onChange(v);
    this._onTouched();
  }

  _onChange = (_: any) => {};
  _onTouched = () => {};
  writeValue(v: any) { this.value = v || ''; }
  registerOnChange(fn: any) { this._onChange = fn; }
  registerOnTouched(fn: any) { this._onTouched = fn; }
}

