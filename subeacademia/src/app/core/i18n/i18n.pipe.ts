import { Pipe, PipeTransform } from '@angular/core';
import { I18nService } from './i18n.service';

@Pipe({
  name: 'i18nTranslate',
  standalone: true,
  // Marcamos como impuro para que actualice cuando cambie el diccionario/idioma
  pure: false,
})
export class I18nTranslatePipe implements PipeTransform {
  constructor(private readonly i18n: I18nService) {}

  transform(key: string | null | undefined): string {
    if (!key) return '';
    try {
      const value = this.i18n.translate(String(key));
      return value || String(key);
    } catch {
      return String(key);
    }
  }
}


