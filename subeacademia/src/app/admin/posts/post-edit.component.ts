import { Component, PLATFORM_ID, OnDestroy, OnInit, inject, signal } from '@angular/core';
import { CommonModule, NgIf, NgFor, isPlatformBrowser } from '@angular/common';
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
import { Subject, takeUntil } from 'rxjs';
import { MediaPickerComponent } from '../shared/media-picker.component';
import { Competency } from '../../features/diagnostico/data/competencias';

function slugify(s:string){ return s.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/(^-|-$)/g,''); }

@Component({
  standalone: true,
  imports: [CommonModule, NgIf, NgFor, ReactiveFormsModule, FormsModule, RouterLink, NgxEditorModule, MediaPickerComponent],
  template: `
  <div class="mx-auto space-y-4">
    <h1 class="text-2xl font-semibold">{{id() ? 'Editar Post' : 'Nuevo Post'}}
      <button class="btn ml-3" type="button" (click)="openPreview()">Vista previa a pantalla completa</button>
      <button class="btn ml-2" type="button" (click)="downloadJson()">⬇️ JSON</button>
      <button class="btn ml-2" type="button" (click)="jsonInput.click()">⬆️ JSON</button>
      <input #jsonInput type="file" accept=".json,application/json" class="hidden" (change)="onJsonFile($event)">
      <button class="btn ml-2" type="button" (click)="jsonBatchInput.click()">⬆️ JSONs</button>
      <input #jsonBatchInput type="file" accept=".json,application/json" class="hidden" multiple (change)="onJsonFilesBatch($event)">
    </h1>
    <form [formGroup]="form" (ngSubmit)="save()" class="grid md:grid-cols-2 gap-4">
      <div class="card p-4 space-y-4">
        <div *ngIf="translationsReady()" class="text-xs inline-flex items-center gap-2 px-2 py-1 rounded bg-emerald-50 text-emerald-700">
          Traducciones listas ✓
        </div>
        <div class="grid gap-3 md:grid-cols-2">
          <label class="block">Idioma
            <select formControlName="lang" class="w-full ui-input">
              <option value="es">es</option><option value="en">en</option><option value="pt">pt</option>
            </select>
          </label>
          <label class="block">Título
            <input
              class="w-full ui-input"
              placeholder="Título"
              formControlName="title">
          </label>
        </div>
        <label class="block">Slug</label>
        <div class="flex items-center gap-2">
          <input
            class="flex-1 ui-input"
            formControlName="slug"
            [readOnly]="lockSlug"
            placeholder="slug-automatico" />
          <button type="button" class="px-3 py-2 rounded-lg border border-[var(--input-border)]" (click)="lockSlug = !lockSlug">{{ lockSlug ? '✏️ Editar' : '🔒 Bloquear' }}</button>
        </div>
        <label class="block">Resumen
          <textarea class="w-full ui-input" rows="3" formControlName="summary"></textarea>
        </label>

        <div class="grid gap-3 md:grid-cols-2 items-start">
          <label class="block">Imagen de portada
            <div class="flex items-center gap-2">
              <input class="w-full ui-input" formControlName="coverUrl" placeholder="https://...">
              <button class="btn" type="button" (click)="pickCover.set(true)">Elegir…</button>
            </div>
            <div class="mt-2" *ngIf="form.value.coverUrl as url">
              <img [src]="url" alt="cover" class="max-h-40 rounded-xl border border-[var(--border)]">
            </div>
          </label>

          <div class="grid gap-3">
            <label class="block">Autor
              <input class="w-full ui-input" placeholder="Nombre del autor" formControlName="authorName" />
            </label>
            <label class="block">URL del autor (opcional)
              <input class="w-full ui-input" placeholder="https://mi-sitio" formControlName="authorUrl" />
            </label>
          </div>
        </div>

        <!-- PDFs adjuntos -->
        <div class="space-y-2">
          <div class="flex items-center justify-between">
            <label class="block font-medium">PDFs adjuntos</label>
            <button class="btn" type="button" (click)="pickPdf.set(true)">Añadir PDF</button>
          </div>
          <div class="grid gap-2" *ngIf="pdfsFromForm().length; else noPdf">
            <div class="flex items-center justify-between text-sm" *ngFor="let m of pdfsFromForm(); let i=index">
              <span class="truncate">{{ m.title || m.url }}</span>
              <button class="btn" type="button" (click)="removePdf(i)">Quitar</button>
            </div>
          </div>
          <ng-template #noPdf>
            <div class="text-sm text-[var(--muted)]">No hay PDFs adjuntos.</div>
          </ng-template>
        </div>

        <div *ngIf="pickPdf()" class="fixed inset-0 bg-black/40 grid place-items-center p-4">
          <div class="card max-w-3xl w-full p-4">
            <div class="flex items-center justify-between mb-3">
              <div class="font-medium">Seleccionar PDF</div>
              <button type="button" class="btn" (click)="pickPdf.set(false)">Cerrar</button>
            </div>
            <app-media-picker (chosen)="onPickPdf($event)"></app-media-picker>
          </div>
        </div>

        <div class="grid gap-3 md:grid-cols-2">
          <label class="block">Categoría
            <select class="w-full ui-input" formControlName="category">
              <option value="">— Seleccionar —</option>
              <option value="articulo">Artículo</option>
              <option value="investigacion">Investigación</option>
              <option value="opinion">Opinión</option>
              <option value="tutorial">Tutorial</option>
              <option value="noticia">Noticia</option>
            </select>
          </label>
          <div></div>
        </div>

        <label class="block">Competencias Relacionadas
          <select class="w-full ui-input" multiple formControlName="relatedCompetencies">
            <option *ngFor="let comp of competencias" [value]="comp.id">{{ comp.name }}</option>
          </select>
          <div class="text-xs text-gray-500 mt-1">
            Selecciona las competencias que este artículo ayuda a desarrollar
          </div>
        </label>

        <div *ngIf="pickCover()" class="fixed inset-0 bg-black/40 grid place-items-center p-4">
          <div class="card max-w-3xl w-full p-4">
            <div class="flex items-center justify-between mb-3">
              <div class="font-medium">Seleccionar imagen de portada</div>
              <button type="button" class="btn" (click)="pickCover.set(false)">Cerrar</button>
            </div>
            <app-media-picker (chosen)="onPickCover($event)"></app-media-picker>
          </div>
        </div>
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
            <select class="w-full ui-input" formControlName="status">
              <option>draft</option><option>published</option><option>scheduled</option>
            </select>
          </label>
          <label class="block">Fecha publicación
            <input type="datetime-local" class="w-full ui-input" formControlName="publishedAtLocal">
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
    category: [''],
    coverUrl: [''],
    authorName: [''],
    authorUrl: [''],
    media: this.fb.nonNullable.control([] as any[]),
    relatedCompetencies: [[] as string[]],
  });

  lockSlug = true;

  private readonly unsubscribe$ = new Subject<void>();

  competencias: Competency[] = [];

  constructor(){
    const maybeId = this.route.snapshot.paramMap.get('id');
    if (maybeId) {
      this.id.set(maybeId);
    }
  }

  ngOnDestroy(): void {
    this.editor?.destroy();
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  ngOnInit(): void {
    // Obtener las competencias disponibles
    this.loadCompetencies();
    
    const slugControl = this.form.controls['slug'] as any;
    const titleControl = this.form.controls['title'] as any;
    let slugManuallyEdited = false;

    if (slugControl?.valueChanges) {
      slugControl.valueChanges
        .pipe(takeUntil(this.unsubscribe$))
        .subscribe(() => {
          if (!this.lockSlug) slugManuallyEdited = true;
        });
    }

    if (titleControl?.valueChanges) {
      titleControl.valueChanges
        .pipe(takeUntil(this.unsubscribe$))
        .subscribe((title: string) => {
          if (this.lockSlug && !slugManuallyEdited) {
            slugControl.setValue(slugify(title || ''), { emitEvent: false });
          }
        });
    }

    const maybeId = this.id();
    if (maybeId) {
      this.posts
        .get(maybeId)
        .pipe(takeUntil(this.unsubscribe$))
        .subscribe(p => {
          if (p)
            this.form.patchValue({
              ...(p as any),
              authorName: (p as any)?.authors?.[0]?.name || '',
              authorUrl: (p as any)?.authors?.[0]?.url || '',
              category: ((p as any)?.categories || [])[0] || (p as any)?.category || '',
              publishedAtLocal: new Date((p as any).publishedAt || Date.now()).toISOString().slice(0, 16)
            });
          this.translationsReady.set(!!(p as any)?.translations?.en && !!(p as any)?.translations?.pt);
        });
    }
  }

  private loadCompetencies(): void {
    // Obtener las competencias desde el archivo de competencias
    import('../../features/diagnostico/data/competencias').then(module => {
      this.competencias = module.COMPETENCIAS_COMPLETAS;
    });
  }

  async save(){
    const v:any = this.form.value;
    // Tomar valores desde translations.es o caer a los campos de compatibilidad
    const currentEs = (v.translations && v.translations.es) ? v.translations.es : {};
    const titleFromForm = (currentEs.title || v.title || '').trim();
    const contentFromForm = (currentEs.content || v.content || '').trim();
    const slugFromForm = (v.slug || '').trim();

    if (!titleFromForm || !slugFromForm || !contentFromForm) {
      alert('Completa ES: Título, Slug y Contenido.');
      return;
    }

    // Sincronizar valores para que el documento quede completo y consistente
    v.title = titleFromForm;
    v.content = contentFromForm;
    v.slug = slugFromForm;
    v.translations = v.translations || {};
    v.translations.es = v.translations.es || {};
    v.translations.es.title = titleFromForm;
    v.translations.es.content = contentFromForm;
    if (!v.translations.es.summary && v.summary) {
      v.translations.es.summary = v.summary;
    }
    if (v.publishedAtLocal) v.publishedAt = new Date(v.publishedAtLocal).getTime();
    delete v.publishedAtLocal;

    // Persistir contentHtml y contentText (plain)
    const tempDiv = this.isBrowser ? document.createElement('div') : null;
    if (tempDiv) {
      tempDiv.innerHTML = v.translations.es.content;
      const text = tempDiv.textContent || tempDiv.innerText || '';
      v.translations.es.contentHtml = v.translations.es.content;
      v.translations.es.contentText = text;
    }

    // Normalizar autores y categorías
    const authorName = (v as any).authorName?.trim();
    const authorUrl = (v as any).authorUrl?.trim();
    v.authors = authorName ? [{ name: authorName, url: authorUrl || undefined }] : [];
    if ((v as any).category) v.categories = [(v as any).category];

    v.updatedAt = Date.now();
    if (!this.id()) v.createdAt = Date.now();

    if (this.id()) await this.posts.update(this.id()!, v);
    else await this.posts.create(v);

    this.router.navigate(['/admin/posts']);
  }

  translationsReady = signal(false);

  pickCover = signal(false);
  onPickCover(m:any){
    this.form.patchValue({ coverUrl: m?.url || '' });
    this.pickCover.set(false);
  }

  pickPdf = signal(false);
  onPickPdf(m:any){
    const isPdf = (m?.contentType || m?.type || '').includes('pdf') || /\.pdf($|\?)/i.test(m?.url || '');
    if (!isPdf) { alert('Selecciona un archivo PDF'); return; }
    const current: any[] = (this.form.value as any).media || [];
    const item = { type: 'pdf', url: m.url, title: m.fileName || m.name || 'PDF' } as any;
    if (!current.some(x => x.url === item.url)) {
      this.form.patchValue({ media: [...current, item] });
    }
    this.pickPdf.set(false);
  }
  removePdf(index:number){
    const current: any[] = (this.form.value as any).media || [];
    const pdfs = current.filter(x => x.type === 'pdf');
    const target = pdfs[index];
    const rest = current.filter(x => x !== target);
    this.form.patchValue({ media: rest });
  }

  pdfsFromForm(): Array<{ type:string; url:string; title?:string }>{
    const v: any = this.form?.value || {};
    const arr: any[] = Array.isArray(v.media) ? v.media : [];
    return arr.filter(x => x && x.type === 'pdf');
  }

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

  // Exportar JSON del formulario listo para importar/guardar
  downloadJson(){
    const v:any = this.form.getRawValue();
    // Normalizar a estructura esperada (misma que guardamos)
    const es = (v.translations?.es) || {};
    const payload = {
      ...v,
      title: (es.title || v.title || '').trim(),
      summary: (es.summary || v.summary || ''),
      content: (es.content || v.content || ''),
      translations: v.translations || { es: { title: v.title, summary: v.summary, content: v.content } },
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    const slug = (v.slug || 'post').toString();
    a.download = `${slug}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  // Importar JSON y rellenar formulario
  onJsonFile(ev: Event){
    const input = ev.target as HTMLInputElement;
    const file = (input?.files || [])[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try{
        const text = String(reader.result || '');
        const data:any = JSON.parse(text);
        // Campos aceptados; protegemos contra claves desconocidas
        const safe:any = {
          lang: data.lang || 'es',
          slug: data.slug || '',
          title: data.title || data?.translations?.es?.title || '',
          summary: data.summary || data?.translations?.es?.summary || '',
          content: data.content || data?.translations?.es?.content || '',
          status: data.status || 'draft',
          publishedAt: data.publishedAt || Date.now(),
          publishedAtLocal: data.publishedAt ? new Date(data.publishedAt).toISOString().slice(0,16) : '',
          tags: Array.isArray(data.tags) ? data.tags : [],
          category: data.category || '',
          coverUrl: data.coverUrl || '',
          authorName: (data.authors?.[0]?.name) || data.authorName || '',
          authorUrl: (data.authors?.[0]?.url) || data.authorUrl || '',
          media: Array.isArray(data.media) ? data.media : [],
          translations: {
            es: {
              title: data?.translations?.es?.title || data.title || '',
              summary: data?.translations?.es?.summary || data.summary || '',
              content: data?.translations?.es?.content || data.content || '',
            },
            en: data?.translations?.en || { title: '', summary: '', content: '' },
            pt: data?.translations?.pt || { title: '', summary: '', content: '' },
          },
          languageFallback: data.languageFallback || 'es'
        };
        this.form.patchValue(safe, { emitEvent: false });
      }catch(err){
        alert('Archivo JSON inválido');
      }finally{
        input.value = '';
      }
    };
    reader.readAsText(file);
  }

  // Importación masiva de múltiples JSONs → crea posts directamente
  async onJsonFilesBatch(ev: Event){
    const input = ev.target as HTMLInputElement;
    const files = Array.from(input?.files || []);
    if (!files.length) return;
    let ok = 0, fail = 0;
    for (let i = 0; i < files.length; i++){
      const file = files[i];
      try{
        const text = await file.text();
        const data:any = JSON.parse(text);
        // Normalización similar a onJsonFile + save()
        const es = (data?.translations?.es) || {};
        const title = (es.title || data.title || '').trim();
        const content = (es.content || data.content || '').trim();
        const slug = (data.slug || '').trim();
        if (!title || !content || !slug) { throw new Error('Faltan campos obligatorios (title/slug/content)'); }
        const authorName = (data.authors?.[0]?.name) || data.authorName || '';
        const authorUrl = (data.authors?.[0]?.url) || data.authorUrl || '';
        const payload:any = {
          lang: data.lang || 'es',
          title,
          slug,
          summary: (es.summary || data.summary || ''),
          content,
          status: data.status || 'published',
          publishedAt: data.publishedAt || (Date.now() - i), // garantizar orden estable si no viene
          tags: Array.isArray(data.tags) ? data.tags : [],
          categories: Array.isArray(data.categories) ? data.categories : (data.category ? [data.category] : []),
          coverUrl: data.coverUrl || '',
          authors: authorName ? [{ name: authorName, url: authorUrl || undefined }] : [],
          media: Array.isArray(data.media) ? data.media : [],
          translations: {
            es: {
              title,
              summary: (es.summary || data.summary || ''),
              content
            },
            en: data?.translations?.en || { title: '', summary: '', content: '' },
            pt: data?.translations?.pt || { title: '', summary: '', content: '' },
          },
          languageFallback: data.languageFallback || 'es'
        };
        // contentHtml y contentText
        if (this.isBrowser){
          const tempDiv = document.createElement('div');
          tempDiv.innerHTML = payload.translations.es.content || '';
          payload.translations.es.contentHtml = payload.translations.es.content;
          payload.translations.es.contentText = tempDiv.textContent || tempDiv.innerText || '';
        }
        await this.posts.create(payload);
        ok++;
      }catch(err){
        console.error('Error importando', file?.name, err);
        fail++;
      }
    }
    alert(`Importación completa: ${ok} creados, ${fail} con error`);
    this.router.navigate(['/admin/posts']);
    if (input) input.value = '';
  }
}

