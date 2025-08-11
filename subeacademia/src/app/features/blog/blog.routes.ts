import { Routes } from '@angular/router';
import { TransferState, makeStateKey } from '@angular/core';
import { inject } from '@angular/core';
import { ContentService } from '../../core/data/content.service';
import { I18nService } from '../../core/i18n/i18n.service';

export const BLOG_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./blog-list.component').then((m) => m.BlogListComponent),
    resolve: {
      firstPage: () => {
        const state = inject(TransferState);
        const svc = inject(ContentService);
        const i18n = inject(I18nService);
        const lang = i18n.currentLang();
        const KEY = makeStateKey<any>(`blog:first:${lang}`);
        const cached = state.get(KEY, null as any);
        if (cached) return cached;
        return new Promise<any>((resolve) => {
          svc.listPosts(lang, 12).subscribe((arr) => {
            state.set(KEY, arr);
            resolve(arr);
          });
        });
      }
    }
  },
  {
    path: ':slug',
    loadComponent: () => import('./post.component').then((m) => m.PostComponent),
  }
];

