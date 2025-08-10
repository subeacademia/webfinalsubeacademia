import { Component, PLATFORM_ID, OnDestroy, OnInit, inject, signal } from '@angular/core';
import { CommonModule, NgIf, isPlatformBrowser } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { PostsService } from '../../core/data/posts.service';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { TranslationService } from '../../core/ai/translation.service';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Editor, NgxEditorModule, Toolbar } from 'ngx-editor';
import { FormsModule } from '@angular/forms';
import { DomSanitizer as AngularSanitizer } from '@angular/platform-browser';

function slugify(s:string){ return s.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/(^-|-$)/g,''); }

@Component({
  standalone: true,
  imports: [CommonModule, NgIf, ReactiveFormsModule, FormsModule, RouterLink, NgxEditorModule],
  template: `
  <div class="mx-auto space-y-4">
    <h1 class="text-2xl font-semibold">{{id() ? 'Editar Post' : 'Nuevo Post'}}
      <button class="btn ml-3" type="button" (click)="openPreview()">Vista previa a pantalla completa</button>
    </h1>
    <form [formGroup]="form" (ngSubmit)="save()" class="grid md:grid-cols-2 gap-4">
      <div class="card p-4 space-y-4">
        <div *ngIf="translationsReady()" class="text-xs inline-flex items-center gap-2 px-2 py-1 rounded bg-emerald-50 text-emerald-700">
          Traducciones listas ✓
        </div>
        <div class="grid gap-3 md:grid-cols-2">
          <label class="block">Idioma
            <select formControlName="lang" class="w-full">
              <option value="es">es</option><option value="en">en</option><option value="pt">pt</option>
            </select>
          </label>
          <label class="block">Título
            <input
              class="w-full bg-[var(--input-bg)] text-[var(--input-fg)] placeholder-[color:var(--input-placeholder)] border border-[var(--input-border)] focus:border-[var(--ring)] focus:ring-2 focus:ring-[var(--ring)]"
              placeholder="Título"
              formControlName="title">
          </label>
        </div>
        <label class="block">Slug</label>
        <div class="flex items-center gap-2">
          <input
            class="flex-1 bg-[var(--input-bg)] text-[var(--input-fg)] placeholder-[color:var(--input-placeholder)] border border-[var(--input-border)] focus:border-[var(--ring)] focus:ring-2 focus:ring-[var(--ring)]"
            formControlName="slug"
            [readOnly]="lockSlug"
            placeholder="slug-automatico" />
          <button type="button" class="px-3 py-2 rounded-lg border border-[var(--input-border)]" (click)="lockSlug = !lockSlug">{{ lockSlug ? '✏️ Editar' : '🔒 Bloquear' }}</button>
        </div>
        <label class="block">Resumen
          <textarea class="w-full" rows="3" formControlName="summary"></textarea>
        </label>
        <div formGroupName="translations">
          <div formGroupName="es">
            <label class="block">Contenido</label>
            <div *ngIf="isBrowser; else ssrNote">
              <ngx-editor-menu [editor]="editor" [toolbar]="toolbar"></ngx-editor-menu>
              <ngx-editor formControlName="content"
                          [editor]="editor"
                          [placeholder]="'Escribe el contenido...'">
              </ngx-editor>
            </div>
          </div>
        </div>
        <ng-template #ssrNote>
          <textarea class="w-full min-h-64 h-64" formControlName="content" placeholder="Editor disponible en navegador"></textarea>
        </ng-template>
        <div class="grid gap-3 md:grid-cols-2">
          <label class="block">Estado
            <select class="w-full" formControlName="status">
              <option>draft</option><option>published</option><option>scheduled</option>
            </select>
          </label>
          <label class="block">Fecha publicación
            <input type="datetime-local" class="w-full" formControlName="publishedAtLocal">
          </label>
        </div>
        <div class="flex gap-3 items-center">
          <button class="btn btn-primary" type="submit">Guardar</button>
          <a class="btn" routerLink="/admin/posts">Volver</a>
        </div>
      </div>
      <aside class="card p-4">
        <div class="text-sm text-[var(--muted)]">Previsualización</div>
        <h2 class="text-2xl font-semibold">{{ form.value.title || 'Sin título' }}</h2>
        <p class="mt-2 text-[var(--muted)]">{{ form.value.summary || '' }}</p>
        <hr class="my-4 border-[var(--input-border)]" />
        <div class="prose prose-invert max-w-none" [innerHTML]="sanitizedContent()"></div>
      </aside>

      <div *ngIf="showPreview()" class="fixed inset-0 bg-black/50 flex items-center justify-center p-4">
        <div class="card max-w-4xl w-full overflow-auto max-h-[85vh] p-0">
          <div class="flex items-center justify-between p-3 border-b border-[var(--border)]">
            <div class="font-medium">Previsualización</div>
            <button class="btn" type="button" (click)="closePreview()">Cerrar</button>
          </div>
          <div class="p-4 prose max-w-none" [innerHTML]="previewHtml"></div>
        </div>
      </div>
    </form>
  </div>
  `
})
export class PostEditComponent implements OnDestroy, OnInit {
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private posts = inject(PostsService);
  private sanitizer = inject(DomSanitizer);
  private translator = inject(TranslationService);
  private http = inject(HttpClient);
  private platformId = inject(PLATFORM_ID);
  protected isBrowser = isPlatformBrowser(this.platformId);
  editor: Editor = this.isBrowser ? new Editor() : (undefined as unknown as Editor);
  toolbar: Toolbar = [
    ['bold', 'italic'],
    ['underline', 'strike'],
    [{ heading: ['h1', 'h2', 'h3'] }],
    ['ordered_list', 'bullet_list'],
    ['link'],
    ['code']
  ];

  // Editor WYSIWYG deshabilitado temporalmente para evitar conflictos de tipos con CKEditor

  id = signal<string|null>(null);
  // Nuevo esquema: translations + languageFallback
  form = this.fb.group({
    lang: ['es', Validators.required],
    translations: this.fb.group({
      es: this.fb.group({ title: ['', Validators.required], summary: [''], content: ['', Validators.required], contentHtml: [''], contentText: [''] }),
      en: this.fb.group({ title: [''], summary: [''], content: [''] }),
      pt: this.fb.group({ title: [''], summary: [''], content: [''] }),
    }),
    languageFallback: ['es', Validators.required],
    title: ['', [Validators.required, Validators.minLength(3)]], // compatibilidad
    slug: ['', Validators.required],
    summary: [''], // compatibilidad
    content: ['', [Validators.required, Validators.minLength(10)]], // compatibilidad
    status: ['published'],
    publishedAt: [Date.now()],
    publishedAtLocal: [''],
    tags: [[] as string[]],
    category: ['']
  });

  lockSlug = true;

  constructor(){
    const maybeId = this.route.snapshot.paramMap.get('id');
    if (maybeId) {
      this.id.set(maybeId);
      this.posts.get(maybeId).subscribe(p => {
        if (p) this.form.patchValue({
          ...(p as any),
          publishedAtLocal: new Date((p as any).publishedAt || Date.now()).toISOString().slice(0,16)
        });
        this.translationsReady.set(!!(p as any)?.translations?.en && !!(p as any)?.translations?.pt);
      });
    }
  }

  ngOnDestroy(): void {
    this.editor?.destroy();
  }

  ngOnInit(): void {
    const slugControl = this.form.controls['slug'] as any;
    const titleControl = this.form.controls['title'] as any;
    let slugManuallyEdited = false;

    if (slugControl?.valueChanges) {
      slugControl.valueChanges.subscribe(() => {
        if (!this.lockSlug) slugManuallyEdited = true;
      });
    }

    if (titleControl?.valueChanges) {
      titleControl.valueChanges.subscribe((title: string) => {
        if (this.lockSlug && !slugManuallyEdited) {
          slugControl.setValue(slugify(title || ''), { emitEvent: false });
        }
      });
    }
  }

  async save(){
    const v:any = this.form.value;
    const es = v.translations?.es || {};
    if (!es.title?.trim() || !v.slug?.trim() || !es.content?.trim()) {
      alert('Completa ES: Título, Slug y Contenido.');
      return;
    }
    if (v.publishedAtLocal) v.publishedAt = new Date(v.publishedAtLocal).getTime();
    delete v.publishedAtLocal;

    // Persistir contentHtml y contentText (plain)
    const tempDiv = this.isBrowser ? document.createElement('div') : null;
    if (tempDiv) {
      tempDiv.innerHTML = es.content;
      const text = tempDiv.textContent || tempDiv.innerText || '';
      v.translations.es.contentHtml = es.content;
      v.translations.es.contentText = text;
    }

    v.updatedAt = Date.now();
    if (!this.id()) v.createdAt = Date.now();

    if (this.id()) await this.posts.update(this.id()!, v);
    else await this.posts.create(v);

    this.router.navigate(['/admin/posts']);
  }

  translationsReady = signal(false);

  showPreview = signal(false);
  previewHtml: SafeHtml = '';
  openPreview(){
    const raw = (this.form.value as any)?.translations?.es?.content || '';
    this.previewHtml = this.sanitizer.bypassSecurityTrustHtml(raw);
    this.showPreview.set(true);
  }
  closePreview(){ this.showPreview.set(false); }

  sanitizedContent(): SafeHtml {
    const raw = (this.form.value as any)?.translations?.es?.content || '';
    return this.sanitizer.bypassSecurityTrustHtml(raw);
  }

  // No-op: con formControlName el contenido se sincroniza automáticamente

  async autoTranslate() {
    const es = (this.form.value as any)?.translations?.es || {};
    if (!environment.backendIaUrl) { alert('Configura environment.backendIaUrl'); return; }
    try{
      const [enRes, ptRes] = await Promise.all([
        this.translator.translateBlocks({ textBlocks: { title: es.title, summary: es.summary, content: es.content }, sourceLang:'es', targetLang:'en' }).toPromise(),
        this.translator.translateBlocks({ textBlocks: { title: es.title, summary: es.summary, content: es.content }, sourceLang:'es', targetLang:'pt' }).toPromise(),
      ]);
      const en = enRes?.data || enRes || {};
      const pt = ptRes?.data || ptRes || {};
      this.form.patchValue({ translations: { en, pt } }, { emitEvent: false });
    }catch(err:any){
      console.error(err);
      alert('Error al traducir automáticamente');
    }
  }
}

