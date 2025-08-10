import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';

declare global {
  interface Window { grecaptcha?: any; }
}

@Injectable({ providedIn: 'root' })
export class RecaptchaV3Service {
  private scriptLoadedPromise: Promise<void> | null = null;
  private readonly siteKey: string = environment.recaptchaV3SiteKey || '';

  private ensureLoaded(): Promise<void> {
    if (this.scriptLoadedPromise) return this.scriptLoadedPromise;
    if (!this.siteKey) {
      this.scriptLoadedPromise = Promise.resolve();
      return this.scriptLoadedPromise;
    }
    this.scriptLoadedPromise = new Promise<void>((resolve, reject) => {
      if (typeof window !== 'undefined' && window.grecaptcha) {
        resolve();
        return;
      }
      const script = document.createElement('script');
      script.src = `https://www.google.com/recaptcha/api.js?render=${encodeURIComponent(this.siteKey)}`;
      script.async = true;
      script.defer = true;
      script.onload = () => resolve();
      script.onerror = () => reject(new Error('No se pudo cargar reCAPTCHA v3'));
      document.head.appendChild(script);
    });
    return this.scriptLoadedPromise;
  }

  async execute(action: string): Promise<string | null> {
    await this.ensureLoaded();
    if (!this.siteKey || typeof window === 'undefined' || !window.grecaptcha) {
      return null; // reCAPTCHA opcional
    }
    return await window.grecaptcha.execute(this.siteKey, { action });
  }
}

