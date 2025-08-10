import { Inject, Injectable } from '@angular/core';
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
    if (data.image) this.meta.updateTag({ property: 'og:image', content: data.image });
    const currentUrl = data.url || (this.document?.location ? this.document.location.href : undefined);
    if (currentUrl) this.meta.updateTag({ property: 'og:url', content: currentUrl });
    this.meta.updateTag({ property: 'og:type', content: data.type || 'website' });

    if (data.title) this.meta.updateTag({ name: 'twitter:title', content: data.title });
    if (data.description)
      this.meta.updateTag({ name: 'twitter:description', content: data.description });
    if (data.image) this.meta.updateTag({ name: 'twitter:image', content: data.image });
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
}

