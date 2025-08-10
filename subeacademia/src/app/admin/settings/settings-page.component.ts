import { Component, inject, signal } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { SettingsService, SiteSettings } from '../../core/data/settings.service';

@Component({
  selector: 'app-admin-settings-page',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
  <h1 class="text-2xl font-semibold mb-3">Ajustes</h1>
  <form [formGroup]="form" class="grid gap-4 md:grid-cols-2" (ngSubmit)="save()">
    <label class="block">Nombre de marca
      <input class="w-full ui-input" formControlName="brandName" />
    </label>
    <label class="block">Logo URL
      <input class="w-full ui-input" formControlName="logoUrl" />
    </label>
    <label class="block">Idioma por defecto
      <select class="w-full ui-input" formControlName="defaultLang">
        <option value="es">es</option><option value="en">en</option><option value="pt">pt</option>
      </select>
    </label>
    <label class="block">Email de contacto
      <input class="w-full ui-input" formControlName="contactEmail" />
    </label>

    <label class="block">GA4 Measurement ID
      <input class="w-full ui-input" formControlName="ga4MeasurementId" />
    </label>
    <label class="block">Search Console Verification
      <input class="w-full ui-input" formControlName="searchConsoleVerification" />
    </label>

    <label class="block">Twitter
      <input class="w-full ui-input" formControlName="twitter" />
    </label>
    <label class="block">LinkedIn
      <input class="w-full ui-input" formControlName="linkedin" />
    </label>
    <label class="block">YouTube
      <input class="w-full ui-input" formControlName="youtube" />
    </label>

    <div class="md:col-span-2">
      <button class="btn btn-primary" type="submit">Guardar</button>
      <span *ngIf="saved()" class="text-green-500 ml-3">Guardado</span>
    </div>
  </form>
  `,
})
export class SettingsPageComponent {
  private fb = inject(FormBuilder);
  private settings = inject(SettingsService);
  saved = signal(false);

  form = this.fb.group({
    brandName: ['Sube Academ-IA', Validators.required],
    logoUrl: [''],
    defaultLang: ['es', Validators.required],
    contactEmail: [''],
    ga4MeasurementId: [''],
    searchConsoleVerification: [''],
    twitter: [''],
    linkedin: [''],
    youtube: [''],
  });

  constructor(){
    this.settings.get().subscribe((s: SiteSettings | undefined) => {
      if (!s) return;
      this.form.patchValue({
        brandName: s.brandName || 'Sube Academ-IA',
        logoUrl: s.logoUrl || '',
        defaultLang: s.defaultLang || 'es',
        contactEmail: s.contactEmail || '',
        ga4MeasurementId: s.ga4MeasurementId || '',
        searchConsoleVerification: s.searchConsoleVerification || '',
        twitter: s.social?.twitter || '',
        linkedin: s.social?.linkedin || '',
        youtube: s.social?.youtube || '',
      });
    });
  }

  async save(){
    const v = this.form.getRawValue();
    await this.settings.save({
      brandName: v.brandName!,
      logoUrl: v.logoUrl!,
      defaultLang: v.defaultLang as any,
      contactEmail: v.contactEmail || undefined,
      ga4MeasurementId: v.ga4MeasurementId || undefined,
      searchConsoleVerification: v.searchConsoleVerification || undefined,
      social: { twitter: v.twitter || undefined, linkedin: v.linkedin || undefined, youtube: v.youtube || undefined }
    });
    this.saved.set(true);
    setTimeout(()=> this.saved.set(false), 2000);
  }
}

