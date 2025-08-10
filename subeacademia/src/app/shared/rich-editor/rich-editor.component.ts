import { Component, forwardRef } from '@angular/core';
import { NG_VALUE_ACCESSOR } from '@angular/forms';
import * as ClassicEditor from '@ckeditor/ckeditor5-build-classic';
import { CKEditorModule } from '@ckeditor/ckeditor5-angular';

@Component({
  selector: 'app-rich-editor',
  standalone: true,
  imports: [CKEditorModule],
  template: `
    <ckeditor [editor]="Editor" [data]="value" (change)="onChange($event)"></ckeditor>
  `,
  providers: [
    { provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => RichEditorComponent), multi: true }
  ]
})
export class RichEditorComponent {
  public Editor = ClassicEditor;
  value = '';

  onChange(e: any) {
    const data = e.editor.getData();
    this.value = data;
    this._onChange(data);
    this._onTouched();
  }

  _onChange = (_: any) => {};
  _onTouched = () => {};
  writeValue(v: any) { this.value = v || ''; }
  registerOnChange(fn: any) { this._onChange = fn; }
  registerOnTouched(fn: any) { this._onTouched = fn; }
}

