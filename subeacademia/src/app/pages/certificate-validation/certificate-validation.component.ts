import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Certificate } from '../../core/models';
import { CertificateService } from '../../features/productos/services/certificate.service';
import { CertificateGeneratorService } from '../../core/services/certificate-generator.service';
import { I18nService } from '../../core/i18n/i18n.service';
import { I18nTranslatePipe } from '../../core/i18n/i18n.pipe';

@Component({
  selector: 'app-certificate-validation',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, I18nTranslatePipe],
  template: `
    <div class="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <!-- Header -->
      <div class="bg-white dark:bg-gray-800 shadow-lg border-b border-gray-200 dark:border-gray-700">
        <div class="container mx-auto px-4 py-6">
          <div class="flex items-center justify-between">
            <div class="flex items-center space-x-3">
              <div class="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                <svg class="w-8 h-8 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"></path>
                </svg>
              </div>
              <div>
                <h1 class="text-2xl font-bold text-gray-900 dark:text-white">{{ 'certificate_validation.title' | i18nTranslate }}</h1>
                <p class="text-gray-600 dark:text-gray-300">{{ 'certificate_validation.subtitle' | i18nTranslate }}</p>
              </div>
            </div>
            <button (click)="goHome()" class="px-4 py-2 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-200 font-medium">
              ← {{ 'certificate_validation.back_home' | i18nTranslate }}
            </button>
          </div>
        </div>
      </div>

      <div class="container mx-auto px-4 py-12">
        <!-- Formulario de búsqueda -->
        <div class="max-w-2xl mx-auto mb-12">
          <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
            <div class="text-center mb-8">
              <h2 class="text-3xl font-bold text-gray-900 dark:text-white mb-2">{{ 'certificate_validation.form_title' | i18nTranslate }}</h2>
              <p class="text-gray-600 dark:text-gray-300">{{ 'certificate_validation.form_subtitle' | i18nTranslate }}</p>
            </div>

            <form [formGroup]="validationForm" (ngSubmit)="validateCertificate()" class="space-y-6">
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {{ 'certificate_validation.code_label' | i18nTranslate }}
                </label>
                <div class="relative">
                  <input 
                    formControlName="certificateCode"
                    class="w-full px-4 py-4 text-lg font-mono border-2 border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    [placeholder]="'certificate_validation.code_placeholder' | i18nTranslate"
                    [class.border-red-500]="validationForm.get('certificateCode')?.invalid && validationForm.get('certificateCode')?.touched"
                  />
                  <div class="absolute inset-y-0 right-0 flex items-center pr-3">
                    <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                    </svg>
                  </div>
                </div>
                <div *ngIf="validationForm.get('certificateCode')?.invalid && validationForm.get('certificateCode')?.touched" class="text-red-500 text-sm mt-1">
                  {{ 'certificate_validation.code_error' | i18nTranslate }}
                </div>
              </div>

              <button 
                type="submit" 
                [disabled]="validationForm.invalid || isValidating"
                class="w-full py-4 px-6 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center"
              >
                <svg *ngIf="isValidating" class="animate-spin -ml-1 mr-3 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                {{ isValidating ? ('certificate_validation.validating' | i18nTranslate) : ('certificate_validation.validate_btn' | i18nTranslate) }}
              </button>
            </form>
          </div>
        </div>

        <!-- Resultados de validación -->
        <div *ngIf="validationResult" class="max-w-4xl mx-auto">
          <!-- Certificado válido -->
          <div *ngIf="validationResult.isValid" class="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900 dark:to-emerald-900 border-2 border-green-200 dark:border-green-700 rounded-2xl p-8 shadow-xl">
            <div class="flex items-start space-x-6">
              <div class="flex-shrink-0">
                <div class="w-16 h-16 bg-green-100 dark:bg-green-800 rounded-full flex items-center justify-center">
                  <svg class="w-8 h-8 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                </div>
              </div>
              <div class="flex-grow">
                <h3 class="text-2xl font-bold text-green-800 dark:text-green-200 mb-2">✅ {{ 'certificate_validation.valid_title' | i18nTranslate }}</h3>
                <p class="text-green-700 dark:text-green-300 mb-6">{{ 'certificate_validation.valid_subtitle' | i18nTranslate }}</p>
                
                <div class="grid md:grid-cols-2 gap-6">
                  <div class="space-y-4">
                    <div class="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm">
                      <h4 class="font-semibold text-gray-900 dark:text-white mb-2">{{ 'certificate_validation.student_info' | i18nTranslate }}</h4>
                      <p class="text-lg font-medium text-gray-800 dark:text-gray-200">{{ validationResult.certificate?.studentName }}</p>
                      <p *ngIf="validationResult.certificate?.grade" class="text-sm text-gray-600 dark:text-gray-400">{{ 'certificate_validation.grade' | i18nTranslate }}: {{ validationResult.certificate?.grade }}/100</p>
                    </div>
                    
                    <div class="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm">
                      <h4 class="font-semibold text-gray-900 dark:text-white mb-2">{{ 'certificate_validation.program' | i18nTranslate }}</h4>
                      <p class="text-lg font-medium text-gray-800 dark:text-gray-200">{{ validationResult.certificate?.courseName }}</p>
                      <p *ngIf="validationResult.certificate?.courseDuration" class="text-sm text-gray-600 dark:text-gray-400">{{ 'certificate_validation.duration' | i18nTranslate }}: {{ validationResult.certificate?.courseDuration }}</p>
                      <p class="text-sm text-gray-600 dark:text-gray-400">{{ 'certificate_validation.type' | i18nTranslate }}: {{ getCertificateTypeText(validationResult.certificate?.certificateType) }}</p>
                    </div>
                    
                    <div class="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm">
                      <h4 class="font-semibold text-gray-900 dark:text-white mb-2">{{ 'certificate_validation.dates' | i18nTranslate }}</h4>
                      <p class="text-sm text-gray-600 dark:text-gray-400">{{ 'certificate_validation.completion' | i18nTranslate }}: {{ validationResult.certificate?.completionDate?.toDate() | date:'fullDate' }}</p>
                      <p class="text-sm text-gray-600 dark:text-gray-400">{{ 'certificate_validation.issued' | i18nTranslate }}: {{ validationResult.certificate?.issuedDate?.toDate() | date:'fullDate' }}</p>
                    </div>
                  </div>
                  
                  <div class="space-y-4">
                    <div class="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm">
                      <h4 class="font-semibold text-gray-900 dark:text-white mb-2">{{ 'certificate_validation.institution' | i18nTranslate }}</h4>
                      <p class="text-lg font-medium text-gray-800 dark:text-gray-200">{{ validationResult.certificate?.institutionName }}</p>
                      <p *ngIf="validationResult.certificate?.instructorName" class="text-sm text-gray-600 dark:text-gray-400">{{ 'certificate_validation.instructor' | i18nTranslate }}: {{ validationResult.certificate?.instructorName }}</p>
                    </div>
                    
                    <div class="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm">
                      <h4 class="font-semibold text-gray-900 dark:text-white mb-2">{{ 'certificate_validation.qr_code' | i18nTranslate }}</h4>
                      <img *ngIf="validationResult.certificate?.qrCode" [src]="validationResult.certificate?.qrCode" [alt]="'certificate_validation.qr_code' | i18nTranslate" class="w-24 h-24 rounded-lg border" />
                      <p class="text-xs text-gray-500 dark:text-gray-400 mt-2">{{ 'certificate_validation.scan_to_validate' | i18nTranslate }}</p>
                    </div>
                    
                    <div class="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm">
                      <h4 class="font-semibold text-gray-900 dark:text-white mb-2">{{ 'certificate_validation.security' | i18nTranslate }}</h4>
                      <div class="space-y-1">
                        <div *ngFor="let feature of validationResult.certificate?.metadata?.securityFeatures || []" class="flex items-center text-xs text-green-600 dark:text-green-400">
                          <svg class="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                            <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"></path>
                          </svg>
                          {{ getSecurityFeatureText(feature) }}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div class="mt-6 p-4 bg-blue-50 dark:bg-blue-900 rounded-xl">
                  <p class="text-sm text-blue-800 dark:text-blue-200">
                    <strong>{{ 'certificate_validation.verification_code' | i18nTranslate }}:</strong> 
                    <code class="bg-blue-100 dark:bg-blue-800 px-2 py-1 rounded font-mono text-xs">{{ validationResult.certificate?.certificateCode }}</code>
                  </p>
                </div>
              </div>
            </div>
          </div>

          <!-- Certificado inválido -->
          <div *ngIf="!validationResult.isValid" class="bg-gradient-to-r from-red-50 to-rose-50 dark:from-red-900 dark:to-rose-900 border-2 border-red-200 dark:border-red-700 rounded-2xl p-8 shadow-xl">
            <div class="flex items-start space-x-6">
              <div class="flex-shrink-0">
                <div class="w-16 h-16 bg-red-100 dark:bg-red-800 rounded-full flex items-center justify-center">
                  <svg class="w-8 h-8 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                  </svg>
                </div>
              </div>
              <div class="flex-grow">
                <h3 class="text-2xl font-bold text-red-800 dark:text-red-200 mb-2">❌ {{ 'certificate_validation.invalid_title' | i18nTranslate }}</h3>
                <p class="text-red-700 dark:text-red-300 mb-4">{{ validationResult.error }}</p>
                
                <div class="bg-white dark:bg-gray-800 rounded-xl p-4">
                  <h4 class="font-semibold text-gray-900 dark:text-white mb-2">{{ 'certificate_validation.invalid_reasons' | i18nTranslate }}</h4>
                  <ul class="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                    <li>• {{ 'certificate_validation.invalid_reason_1' | i18nTranslate }}</li>
                    <li>• {{ 'certificate_validation.invalid_reason_2' | i18nTranslate }}</li>
                    <li>• {{ 'certificate_validation.invalid_reason_3' | i18nTranslate }}</li>
                    <li>• {{ 'certificate_validation.invalid_reason_4' | i18nTranslate }}</li>
                  </ul>
                </div>
                
                <div class="mt-4 p-4 bg-yellow-50 dark:bg-yellow-900 rounded-xl">
                  <p class="text-sm text-yellow-800 dark:text-yellow-200">
                    <strong>{{ 'certificate_validation.need_help' | i18nTranslate }}</strong> {{ 'certificate_validation.contact_support' | i18nTranslate }}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Información adicional -->
        <div class="max-w-4xl mx-auto mt-12">
          <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8">
            <h3 class="text-xl font-bold text-gray-900 dark:text-white mb-4">{{ 'certificate_validation.how_it_works' | i18nTranslate }}</h3>
            <div class="grid md:grid-cols-3 gap-6">
              <div class="text-center">
                <div class="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <svg class="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"></path>
                  </svg>
                </div>
                <h4 class="font-semibold text-gray-900 dark:text-white mb-2">{{ 'certificate_validation.step_1' | i18nTranslate }}</h4>
                <p class="text-sm text-gray-600 dark:text-gray-400">{{ 'certificate_validation.step_1_desc' | i18nTranslate }}</p>
              </div>
              <div class="text-center">
                <div class="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <svg class="w-6 h-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path>
                  </svg>
                </div>
                <h4 class="font-semibold text-gray-900 dark:text-white mb-2">{{ 'certificate_validation.step_2' | i18nTranslate }}</h4>
                <p class="text-sm text-gray-600 dark:text-gray-400">{{ 'certificate_validation.step_2_desc' | i18nTranslate }}</p>
              </div>
              <div class="text-center">
                <div class="w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <svg class="w-6 h-6 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
                  </svg>
                </div>
                <h4 class="font-semibold text-gray-900 dark:text-white mb-2">{{ 'certificate_validation.step_3' | i18nTranslate }}</h4>
                <p class="text-sm text-gray-600 dark:text-gray-400">{{ 'certificate_validation.step_3_desc' | i18nTranslate }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class CertificateValidationComponent implements OnInit {
  validationForm: FormGroup;
  validationResult: {
    isValid: boolean;
    certificate?: Certificate;
    error?: string;
  } | null = null;
  isValidating = false;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private certificateService: CertificateService,
    private certificateGenerator: CertificateGeneratorService,
    public readonly i18n: I18nService
  ) {
    this.validationForm = this.fb.group({
      certificateCode: ['', [Validators.required, Validators.minLength(5)]]
    });
  }

  ngOnInit() {
    // Verificar si hay un código en la URL
    const codeFromUrl = this.route.snapshot.paramMap.get('code');
    if (codeFromUrl) {
      this.validationForm.patchValue({ certificateCode: codeFromUrl });
      this.validateCertificate();
    }
  }

  async validateCertificate() {
    if (this.validationForm.invalid) {
      this.validationForm.markAllAsTouched();
      return;
    }

    this.isValidating = true;
    this.validationResult = null;

    try {
      const code = this.validationForm.get('certificateCode')?.value;
      const result = await this.certificateService.getCertificateByCode(code);

      if (result.exists && result.data) {
        // Verificar integridad adicional
        const isIntegrityValid = this.certificateGenerator.isCertificateValid(result.data);
        
        this.validationResult = {
          isValid: result.isValid && isIntegrityValid && result.data.status === 'active',
          certificate: result.data,
          error: !isIntegrityValid ? 'El certificado ha sido comprometido o modificado' :
                 result.data.status !== 'active' ? `Certificado ${this.getStatusText(result.data.status).toLowerCase()}` :
                 undefined
        };
      } else {
        this.validationResult = {
          isValid: false,
          error: 'El código de certificado no corresponde a ningún certificado emitido por nuestra institución.'
        };
      }
    } catch (error) {
      console.error('Error validating certificate:', error);
      this.validationResult = {
        isValid: false,
        error: 'Ocurrió un error al intentar validar el certificado. Por favor, inténtalo de nuevo.'
      };
    } finally {
      this.isValidating = false;
    }
  }

  getCertificateTypeText(type?: string): string {
    switch (type) {
      case 'completion': return this.i18n.translate('certificate_validation.type_completion') || 'Certificado de Completación';
      case 'achievement': return this.i18n.translate('certificate_validation.type_achievement') || 'Certificado de Logro';
      case 'participation': return this.i18n.translate('certificate_validation.type_participation') || 'Certificado de Participación';
      default: return this.i18n.translate('certificate_validation.type_default') || 'Certificado';
    }
  }

  getStatusText(status: string): string {
    switch (status) {
      case 'active': return this.i18n.translate('certificate_validation.status_active') || 'Activo';
      case 'revoked': return this.i18n.translate('certificate_validation.status_revoked') || 'Revocado';
      case 'expired': return this.i18n.translate('certificate_validation.status_expired') || 'Expirado';
      default: return this.i18n.translate('certificate_validation.status_unknown') || 'Desconocido';
    }
  }

  getSecurityFeatureText(feature: string): string {
    switch (feature) {
      case 'SHA256_HASH_VERIFICATION': return this.i18n.translate('certificate_validation.security_sha256') || 'Verificación Hash SHA-256';
      case 'QR_CODE_VALIDATION': return this.i18n.translate('certificate_validation.security_qr') || 'Validación por Código QR';
      case 'TIMESTAMP_VERIFICATION': return this.i18n.translate('certificate_validation.security_timestamp') || 'Verificación de Marca Temporal';
      case 'UNIQUE_CERTIFICATE_CODE': return this.i18n.translate('certificate_validation.security_unique') || 'Código Único de Certificado';
      default: return feature;
    }
  }

  goHome() {
    this.router.navigate(['/']);
  }
}
