import { Inject, Injectable, inject } from '@angular/core';
import { SettingsService } from '../data/settings.service';
import { Meta, Title } from '@angular/platform-browser';
import { DOCUMENT } from '@angular/common';
import type { JsonLd } from './jsonld';

export interface SeoData {
  title?: string;
  description?: string;
  image?: string;
  url?: string;
  type?: 'website' | 'article';
}

@Injectable({ providedIn: 'root' })
export class SeoService {
  constructor(
    private readonly title: Title,
    private readonly meta: Meta,
    @Inject(DOCUMENT) private readonly document: Document,
  ) {}

  updateTags(data: SeoData) {
    if (data.title) this.title.setTitle(data.title);
    if (data.description)
      this.meta.updateTag({ name: 'description', content: data.description });

    if (data.title) this.meta.updateTag({ property: 'og:title', content: data.title });
    if (data.description)
      this.meta.updateTag({ property: 'og:description', content: data.description });
    const ogImage = data.image || 'assets/og-placeholder.svg';
    if (ogImage) this.meta.updateTag({ property: 'og:image', content: ogImage });
    const currentUrl = data.url || (this.document?.location ? this.document.location.href : undefined);
    if (currentUrl) this.meta.updateTag({ property: 'og:url', content: currentUrl });
    this.meta.updateTag({ property: 'og:type', content: data.type || 'website' });

    if (data.title) this.meta.updateTag({ name: 'twitter:title', content: data.title });
    if (data.description)
      this.meta.updateTag({ name: 'twitter:description', content: data.description });
    if (ogImage) this.meta.updateTag({ name: 'twitter:image', content: ogImage });
    this.meta.updateTag({ name: 'twitter:card', content: 'summary_large_image' });
  }

  setJsonLd(id: string, data: JsonLd) {
    const scriptId = `jsonld-${id}`;
    let script = this.document.getElementById(scriptId) as HTMLScriptElement | null;
    if (!script) {
      script = this.document.createElement('script');
      script.type = 'application/ld+json';
      script.id = scriptId;
      this.document.head.appendChild(script);
    }
    script.text = JSON.stringify(data);
  }

  // Opcional: permitir inyección dinámica de GA4 y Search Console a partir de ajustes
  initFromSettingsOnce() {
    try {
      const settings = inject(SettingsService);
      settings.get().subscribe((s) => {
        if (!s) return;
        // GA4
        const id = s.ga4MeasurementId;
        if (id && !this.document.getElementById('ga4-src')) {
          const s1 = this.document.createElement('script');
          s1.async = true; s1.id = 'ga4-src';
          s1.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(id)}`;
          this.document.head.appendChild(s1);
          const inline = this.document.createElement('script');
          inline.id = 'ga4-inline';
          inline.text = `window.dataLayer = window.dataLayer || [];\nfunction gtag(){dataLayer.push(arguments);}\ngtag('js', new Date());\ngtag('config', '${id}', { anonymize_ip: true });`;
          this.document.head.appendChild(inline);
        }
        // Search Console
        const token = s.searchConsoleVerification;
        if (token && !this.document.querySelector('meta[name="google-site-verification"]')) {
          const meta = this.document.createElement('meta');
          meta.setAttribute('name', 'google-site-verification');
          meta.setAttribute('content', token);
          this.document.head.appendChild(meta);
        }
      });
    } catch {}
  }
}

