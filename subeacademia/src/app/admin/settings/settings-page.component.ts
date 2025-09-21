import { Component, inject, signal } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { LocalSettingsService, LocalSiteSettings } from '../../core/services/local-settings.service';
import { ToastService } from '../../core/services/ui/toast/toast.service';
import { TypewriterManagerComponent } from './typewriter-manager.component';

@Component({
  selector: 'app-admin-settings-page',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, TypewriterManagerComponent],
  template: `
  <h1 class="text-2xl font-semibold mb-3">Ajustes</h1>
  <form [formGroup]="form" class="grid gap-4 md:grid-cols-2" (ngSubmit)="save()">
    <!-- Configuración Principal -->
    <div class="md:col-span-2 mb-4">
      <h2 class="text-xl font-medium mb-3 text-blue-600">🏠 Configuración de la Página Principal</h2>
    </div>
    
    <label class="block">Título de la Página de Inicio
      <input class="w-full ui-input" formControlName="homeTitle" 
             placeholder="Potencia tu Talento en la Era de la Inteligencia Artificial" />
      <small class="text-gray-500">Este es el título principal que aparece en el hero de la página de inicio</small>
    </label>
    
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

    <!-- Configuración SEO -->
    <div class="md:col-span-2 mb-4 mt-6">
      <h2 class="text-xl font-medium mb-3 text-green-600">🔍 Configuración SEO</h2>
    </div>

    <label class="block">GA4 Measurement ID
      <input class="w-full ui-input" formControlName="ga4MeasurementId" />
    </label>
    <label class="block">Search Console Verification
      <input class="w-full ui-input" formControlName="searchConsoleVerification" />
    </label>

    <!-- Redes Sociales -->
    <div class="md:col-span-2 mb-4 mt-6">
      <h2 class="text-xl font-medium mb-3 text-purple-600">📱 Redes Sociales</h2>
    </div>

    <label class="block">Twitter
      <input class="w-full ui-input" formControlName="twitter" />
    </label>
    <label class="block">LinkedIn
      <input class="w-full ui-input" formControlName="linkedin" />
    </label>
    <label class="block">YouTube
      <input class="w-full ui-input" formControlName="youtube" />
    </label>

    <div class="md:col-span-2 mt-6">
      <button class="btn btn-primary" type="submit">Guardar</button>
      <span *ngIf="saved()" class="text-green-500 ml-3">✅ Guardado</span>
    </div>
  </form>

  <div class="mt-8">
    <app-typewriter-manager></app-typewriter-manager>
  </div>
  `,
})
export class SettingsPageComponent {
  private fb = inject(FormBuilder);
  private settings = inject(LocalSettingsService);
  private toast = inject(ToastService);
  saved = signal(false);

  form = this.fb.group({
    homeTitle: ['Potencia tu Talento en la Era de la Inteligencia Artificial'],
    brandName: ['Sube Academ-I', Validators.required],
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
    this.settings.get().subscribe((s: LocalSiteSettings) => {
      this.form.patchValue({
        homeTitle: s.homeTitle || 'Potencia tu Talento en la Era de la Inteligencia Artificial',
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
    try {
      await this.settings.save({
        homeTitle: v.homeTitle || 'Potencia tu Talento en la Era de la Inteligencia Artificial',
        brandName: v.brandName!,
        logoUrl: v.logoUrl!,
        defaultLang: v.defaultLang as any,
        contactEmail: v.contactEmail || undefined,
        ga4MeasurementId: v.ga4MeasurementId || undefined,
        searchConsoleVerification: v.searchConsoleVerification || undefined,
        social: { twitter: v.twitter || undefined, linkedin: v.linkedin || undefined, youtube: v.youtube || undefined }
      });
      this.toast.success('Ajustes guardados correctamente');
      this.saved.set(true);
      setTimeout(()=> this.saved.set(false), 2000);
    } catch (error) {
      console.error('Error guardando ajustes:', error);
      this.toast.error('No se pudieron guardar los ajustes');
    }
  }
}

