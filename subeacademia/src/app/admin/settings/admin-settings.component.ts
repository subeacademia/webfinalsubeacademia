import { ChangeDetectionStrategy, Component, OnDestroy, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { SettingsService } from '../../core/services/settings.service';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-admin-settings',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatFormFieldModule, MatInputModule, MatButtonModule, MatSelectModule],
  template: `
    <h1 class="text-2xl font-semibold mb-4">Admin · Settings</h1>
    <form [formGroup]="form" class="grid grid-cols-1 md:grid-cols-2 gap-4" (ngSubmit)="save()">
      <div class="space-y-3">
        <mat-form-field appearance="outline" class="w-full">
          <mat-label>Nombre de marca</mat-label>
          <input matInput formControlName="brandName" />
        </mat-form-field>
        <mat-form-field appearance="outline" class="w-full">
          <mat-label>Logo URL</mat-label>
          <input matInput formControlName="logoUrl" />
        </mat-form-field>
        <mat-form-field appearance="outline" class="w-full">
          <mat-label>Idioma por defecto</mat-label>
          <mat-select formControlName="defaultLang">
            <mat-option value="es">ES</mat-option>
            <mat-option value="pt">PT</mat-option>
            <mat-option value="en">EN</mat-option>
          </mat-select>
        </mat-form-field>
      </div>

      <div class="space-y-3">
        <mat-form-field appearance="outline" class="w-full">
          <mat-label>Twitter</mat-label>
          <input matInput formControlName="twitter" />
        </mat-form-field>
        <mat-form-field appearance="outline" class="w-full">
          <mat-label>LinkedIn</mat-label>
          <input matInput formControlName="linkedin" />
        </mat-form-field>
        <mat-form-field appearance="outline" class="w-full">
          <mat-label>YouTube</mat-label>
          <input matInput formControlName="youtube" />
        </mat-form-field>
        <mat-form-field appearance="outline" class="w-full">
          <mat-label>GitHub</mat-label>
          <input matInput formControlName="github" />
        </mat-form-field>
        <mat-form-field appearance="outline" class="w-full">
          <mat-label>Instagram</mat-label>
          <input matInput formControlName="instagram" />
        </mat-form-field>
      </div>

      <div class="md:col-span-2">
        <button mat-flat-button color="primary">Guardar</button>
      </div>
    </form>
    <p class="text-sm text-green-700 mt-2" *ngIf="saved()">Guardado.</p>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminSettingsComponent implements OnInit, OnDestroy {
  private readonly fb = inject(FormBuilder);
  private readonly settings = inject(SettingsService);

  saved = signal(false);

  form = this.fb.group({
    brandName: ['Sube Academ-IA', Validators.required],
    logoUrl: [''],
    defaultLang: ['es', Validators.required],
    twitter: [''],
    linkedin: [''],
    youtube: [''],
    github: [''],
    instagram: [''],
  });

  private readonly unsubscribe$ = new Subject<void>();

  ngOnInit(): void {
    this.settings
      .getSettings()
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe(s => {
        if (s) {
          this.form.patchValue({
            brandName: s.brandName,
            logoUrl: s.logoUrl,
            defaultLang: s.defaultLang,
            twitter: s.socials?.twitter || '',
            linkedin: s.socials?.linkedin || '',
            youtube: s.socials?.youtube || '',
            github: s.socials?.github || '',
            instagram: s.socials?.instagram || '',
          });
        }
      });
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  async save() {
    if (this.form.invalid) return;
    const v = this.form.getRawValue();
    await this.settings.saveSettings({
      brandName: v.brandName!,
      logoUrl: v.logoUrl!,
      defaultLang: v.defaultLang as any,
      socials: {
        twitter: v.twitter || undefined,
        linkedin: v.linkedin || undefined,
        youtube: v.youtube || undefined,
        github: v.github || undefined,
        instagram: v.instagram || undefined,
      }
    });
    this.saved.set(true);
    setTimeout(() => this.saved.set(false), 2000);
  }
}

