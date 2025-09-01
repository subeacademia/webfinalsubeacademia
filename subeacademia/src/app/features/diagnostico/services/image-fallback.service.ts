import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ImageFallbackService {
  
  private readonly FALLBACK_IMAGES = {
    logo: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgdmlld0JveD0iMCAwIDEwMCAxMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIxMDAiIGhlaWdodD0iMTAwIiBmaWxsPSIjRjNGNEY2Ii8+Cjx0ZXh0IHg9IjUwIiB5PSI1NSIgZm9udC1mYW1pbHk9IkFyaWFsLCBzYW5zLXNlcmlmIiBmb250LXNpemU9IjE0IiBmaWxsPSIjNkI3MjgwIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj5Mb2dvPC90ZXh0Pgo8L3N2Zz4K',
    placeholder: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjE1MCIgdmlld0JveD0iMCAwIDIwMCAxNTAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMTUwIiBmaWxsPSIjRjNGNEY2Ii8+Cjx0ZXh0IHg9IjEwMCIgeT0iODAiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxNiIgZmlsbD0iIzZCNzI4MCIgdGV4dC1hbmNob3I9Im1pZGRsZSI+SW1hZ2VuPC90ZXh0Pgo8L3N2Zz4K'
  };

  /**
   * Obtiene una imagen de fallback para logos
   */
  getFallbackLogo(): string {
    return this.FALLBACK_IMAGES.logo;
  }

  /**
   * Obtiene una imagen de fallback genérica
   */
  getFallbackImage(): string {
    return this.FALLBACK_IMAGES.placeholder;
  }

  /**
   * Maneja el error de carga de imagen y devuelve una imagen de fallback
   */
  handleImageError(event: Event, fallbackType: 'logo' | 'placeholder' = 'placeholder'): void {
    const img = event.target as HTMLImageElement;
    if (img) {
      img.src = fallbackType === 'logo' ? this.getFallbackLogo() : this.getFallbackImage();
      img.alt = 'Imagen no disponible';
    }
  }

  /**
   * Genera una URL de placeholder SVG personalizada
   */
  generatePlaceholderSVG(width: number = 200, height: number = 150, text: string = 'Imagen'): string {
    const svg = `
      <svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="${width}" height="${height}" fill="#F3F4F6"/>
        <text x="${width/2}" y="${height/2}" font-family="Arial, sans-serif" font-size="16" fill="#6B7280" text-anchor="middle" dominant-baseline="middle">${text}</text>
      </svg>
    `;
    return `data:image/svg+xml;base64,${btoa(svg)}`;
  }

  /**
   * Verifica si una URL de imagen es válida
   */
  isValidImageUrl(url: string): boolean {
    if (!url) return false;
    
    // Verificar si es una URL válida
    try {
      new URL(url);
    } catch {
      return false;
    }
    
    // Verificar si no es un placeholder que sabemos que falla
    const problematicDomains = ['via.placeholder.com'];
    return !problematicDomains.some(domain => url.includes(domain));
  }
}
