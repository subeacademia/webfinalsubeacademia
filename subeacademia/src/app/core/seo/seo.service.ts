import { Injectable } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';

export interface SeoData {
  title?: string;
  description?: string;
  image?: string;
}

@Injectable({ providedIn: 'root' })
export class SeoService {
  constructor(private readonly title: Title, private readonly meta: Meta) {}

  updateTags(data: SeoData) {
    if (data.title) this.title.setTitle(data.title);
    if (data.description)
      this.meta.updateTag({ name: 'description', content: data.description });

    if (data.title) this.meta.updateTag({ property: 'og:title', content: data.title });
    if (data.description)
      this.meta.updateTag({ property: 'og:description', content: data.description });
    if (data.image) this.meta.updateTag({ property: 'og:image', content: data.image });

    if (data.title) this.meta.updateTag({ name: 'twitter:title', content: data.title });
    if (data.description)
      this.meta.updateTag({ name: 'twitter:description', content: data.description });
    if (data.image) this.meta.updateTag({ name: 'twitter:image', content: data.image });
    this.meta.updateTag({ name: 'twitter:card', content: 'summary_large_image' });
  }
}

