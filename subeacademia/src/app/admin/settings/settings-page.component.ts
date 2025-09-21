import { Component, inject, signal } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { LocalSettingsService, LocalSiteSettings } from '../../core/services/local-settings.service';
import { SettingsService as DataSettingsService } from '../../core/data/settings.service';
import { MediaService } from '../../core/data/media.service';
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
      <input class="w-full rounded-md border border-gray-300 bg-white text-gray-800 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm" formControlName="homeTitle" 
             placeholder="Potencia tu Talento en la Era de la Inteligencia Artificial" />
      <small class="text-gray-500">Este es el título principal que aparece en el hero de la página de inicio</small>
    </label>
    
    <label class="block">Nombre de marca
      <input class="w-full rounded-md border border-gray-300 bg-white text-gray-800 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm" formControlName="brandName" />
    </label>

    <!-- Selección de fondo del Home -->
    <label class="block">Fondo del Home
      <select class="w-full rounded-md border border-gray-300 bg-white text-gray-800 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm" formControlName="homeBackgroundKey">
        <option value="neural-3d-v1">Red Neuronal 3D - Versión 1</option>
        <option value="tech-lines-3d-v1">Líneas Tecnológicas 3D - Versión 1</option>
        <option value="elegant-network-v1">Red Elegante 3D - Versión 1</option>
        <option value="ai-neural-flow-v1">Redes de Neuronas Artificiales - Versión 1</option>
        <option value="circuit-tech-v1">Circuitos Tecnológicos - Versión 1</option>
        <option value="circuit-tech-v2">Circuitos Tecnológicos 3D - Versión 2</option>
        <option value="circuit-tech-v2-light">Circuitos Tecnológicos 3D - Versión 2 (Light)</option>
      </select>
      <small class="text-gray-500">Puedes elegir el componente visual del fondo del hero</small>
    </label>
    
    <label class="block">Logo URL
      <div class="flex gap-2 items-center">
        <input class="w-full rounded-md border border-gray-300 bg-white text-gray-800 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm" formControlName="logoUrl" />
        <label class="btn">
          Subir logo
          <input type="file" accept="image/*" class="hidden" (change)="onLogoFile($event)">
        </label>
      </div>
      <small class="text-gray-500">Si dejas vacío el nombre de marca, se mostrará solo el logo</small>
    </label>
    
    <label class="block">Idioma por defecto
      <select class="w-full rounded-md border border-gray-300 bg-white text-gray-800 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm" formControlName="defaultLang">
        <option value="es">es</option><option value="en">en</option><option value="pt">pt</option>
      </select>
    </label>
    
    <label class="block">Email de contacto
      <input class="w-full rounded-md border border-gray-300 bg-white text-gray-800 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm" formControlName="contactEmail" />
    </label>

    <!-- Configuración SEO -->
    <div class="md:col-span-2 mb-4 mt-6">
      <h2 class="text-xl font-medium mb-3 text-green-600">🔍 Configuración SEO</h2>
    </div>

    <label class="block">GA4 Measurement ID
      <input class="w-full rounded-md border border-gray-300 bg-white text-gray-800 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm" formControlName="ga4MeasurementId" />
    </label>
    <label class="block">Search Console Verification
      <input class="w-full rounded-md border border-gray-300 bg-white text-gray-800 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm" formControlName="searchConsoleVerification" />
    </label>

    <!-- Redes Sociales -->
    <div class="md:col-span-2 mb-4 mt-6">
      <h2 class="text-xl font-medium mb-3 text-purple-600">📱 Redes Sociales</h2>
    </div>

    <label class="block">Twitter
      <input class="w-full rounded-md border border-gray-300 bg-white text-gray-800 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm" formControlName="twitter" />
    </label>
    <label class="block">LinkedIn
      <input class="w-full rounded-md border border-gray-300 bg-white text-gray-800 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm" formControlName="linkedin" />
    </label>
    <label class="block">YouTube
      <input class="w-full rounded-md border border-gray-300 bg-white text-gray-800 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm" formControlName="youtube" />
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
  private dataSettings = inject(DataSettingsService);
  private media = inject(MediaService);
  private toast = inject(ToastService);
  saved = signal(false);

  form = this.fb.group({
    homeTitle: ['Potencia tu Talento en la Era de la Inteligencia Artificial'],
    brandName: ['Sube Academ-I'],
    logoUrl: [''],
    defaultLang: ['es', Validators.required],
    contactEmail: [''],
    ga4MeasurementId: [''],
    searchConsoleVerification: [''],
    twitter: [''],
    linkedin: [''],
    youtube: [''],
    homeBackgroundKey: ['neural-3d-v1'],
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
        homeBackgroundKey: s.homeBackgroundKey || 'neural-3d-v1',
      });
    });
  }

  async save(){
    const v = this.form.getRawValue();
    try {
      await this.settings.save({
        homeTitle: v.homeTitle || 'Potencia tu Talento en la Era de la Inteligencia Artificial',
        brandName: (v.brandName || '').trim(),
        logoUrl: v.logoUrl!,
        defaultLang: v.defaultLang as any,
        contactEmail: v.contactEmail || undefined,
        ga4MeasurementId: v.ga4MeasurementId || undefined,
        searchConsoleVerification: v.searchConsoleVerification || undefined,
        social: { twitter: v.twitter || undefined, linkedin: v.linkedin || undefined, youtube: v.youtube || undefined },
        homeBackgroundKey: v.homeBackgroundKey || 'neural-3d-v1',
        homeBackgroundName: ((): string | undefined => {
          switch(v.homeBackgroundKey){
            case 'neural-3d-v1': return 'Red Neuronal 3D - Versión 1';
            case 'tech-lines-3d-v1': return 'Líneas Tecnológicas 3D - Versión 1';
            case 'elegant-network-v1': return 'Red Elegante 3D - Versión 1';
            case 'ai-neural-flow-v1': return 'Redes de Neuronas Artificiales - Versión 1';
            case 'circuit-tech-v1': return 'Circuitos Tecnológicos - Versión 1';
            case 'circuit-tech-v2': return 'Circuitos Tecnológicos 3D - Versión 2';
            case 'circuit-tech-v2-light': return 'Circuitos Tecnológicos 3D - Versión 2 (Light)';
            default: return undefined;
          }
        })()
      });
      try {
        await this.dataSettings.save({
          brandName: (v.brandName || '').trim(),
          logoUrl: v.logoUrl || undefined,
          defaultLang: (v.defaultLang as any) || 'es',
          contactEmail: v.contactEmail || undefined,
          ga4MeasurementId: v.ga4MeasurementId || undefined,
          searchConsoleVerification: v.searchConsoleVerification || undefined,
          social: {
            twitter: v.twitter || undefined,
            linkedin: v.linkedin || undefined,
            youtube: v.youtube || undefined
          },
          // Publicamos también el fondo del Home en Firestore para que se propague a todos los dispositivos
          homeBackgroundKey: v.homeBackgroundKey || 'neural-3d-v1',
          homeBackgroundName: ((): string | undefined => {
            switch(v.homeBackgroundKey){
              case 'neural-3d-v1': return 'Red Neuronal 3D - Versión 1';
              case 'tech-lines-3d-v1': return 'Líneas Tecnológicas 3D - Versión 1';
              case 'elegant-network-v1': return 'Red Elegante 3D - Versión 1';
              case 'ai-neural-flow-v1': return 'Redes de Neuronas Artificiales - Versión 1';
              case 'circuit-tech-v1': return 'Circuitos Tecnológicos - Versión 1';
              case 'circuit-tech-v2': return 'Circuitos Tecnológicos 3D - Versión 2';
              case 'circuit-tech-v2-light': return 'Circuitos Tecnológicos 3D - Versión 2 (Light)';
              default: return undefined;
            }
          })()
        } as any);
        // Además, publica el fondo por idioma actual (es) para que Home lo lea directamente
        await this.dataSettings.setHomeBackgroundKey('es', v.homeBackgroundKey || 'neural-3d-v1', ((): string | undefined => {
          switch(v.homeBackgroundKey){
            case 'neural-3d-v1': return 'Red Neuronal 3D - Versión 1';
            case 'tech-lines-3d-v1': return 'Líneas Tecnológicas 3D - Versión 1';
            case 'elegant-network-v1': return 'Red Elegante 3D - Versión 1';
            case 'ai-neural-flow-v1': return 'Redes de Neuronas Artificiales - Versión 1';
            case 'circuit-tech-v1': return 'Circuitos Tecnológicos - Versión 1';
            case 'circuit-tech-v2': return 'Circuitos Tecnológicos 3D - Versión 2';
            case 'circuit-tech-v2-light': return 'Circuitos Tecnológicos 3D - Versión 2 (Light)';
            default: return undefined;
          }
        })());
      } catch (err) {
        console.warn('No se pudo guardar en Firestore (continuamos con local):', err);
      }
      this.toast.success('Ajustes guardados correctamente');
      this.saved.set(true);
      setTimeout(()=> this.saved.set(false), 2000);
    } catch (error) {
      console.error('Error guardando ajustes:', error);
      this.toast.error('No se pudieron guardar los ajustes');
    }
  }

  async onLogoFile(e:any){
    const file: File | undefined = (e?.target?.files && e.target.files[0]) as File | undefined;
    if (!file) return;
    try{
      const normalized = await this.media.normalizeLogoImage(file);
      const uploaded = await this.media.upload(normalized || file, 'public/brand');
      this.form.patchValue({ logoUrl: uploaded.url });
      this.toast.success('Logo subido');
    }catch(err){
      console.error('Error subiendo logo', err);
      this.toast.error('No se pudo subir el logo');
    }
  }
}

