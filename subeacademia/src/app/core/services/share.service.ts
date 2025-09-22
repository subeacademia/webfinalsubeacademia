import { Injectable, inject } from '@angular/core';
import { StorageService } from '../storage.service';

@Injectable({ providedIn: 'root' })
export class ShareService {
  private storage = inject(StorageService);

  async captureElementAsBlob(element: HTMLElement, scale = 2): Promise<Blob> {
    const html2canvas = (await import('html2canvas')).default;
    const canvas = await html2canvas(element, { scale, useCORS: true, backgroundColor: null });
    return await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob((blob) => blob ? resolve(blob) : reject(new Error('No se pudo generar la imagen')), 'image/png', 0.98);
    });
  }

  async shareViaDevice(blob: Blob, text: string, fileName = 'diagnostico-ia.png'): Promise<boolean> {
    try {
      const file = new File([blob], fileName, { type: 'image/png' });
      if ((navigator as any).canShare && (navigator as any).canShare({ files: [file] })) {
        await (navigator as any).share({ files: [file], text, title: 'Diagnóstico de Madurez en IA' });
        return true;
      }
      return false;
    } catch {
      return false;
    }
  }

  async uploadAndGetUrl(blob: Blob, fileName = `diagnostic-${Date.now()}.png`): Promise<string> {
    const file = new File([blob], fileName, { type: 'image/png' });
    const res = await this.storage.uploadPublicCategory('media', file);
    return res.url;
  }

  openFacebookShare(imageUrl: string, quote: string) {
    const u = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(imageUrl)}&quote=${encodeURIComponent(quote)}`;
    window.open(u, '_blank', 'noopener');
  }

  openLinkedInShare(url: string) {
    const u = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`;
    window.open(u, '_blank', 'noopener');
  }
}


