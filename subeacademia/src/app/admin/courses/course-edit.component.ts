import { Component, OnDestroy, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ReactiveFormsModule, FormArray, FormBuilder, Validators, FormGroup } from '@angular/forms';
import { CoursesService } from '../../core/data/courses.service';
import { CommonModule } from '@angular/common';
import { MediaPickerComponent } from '../shared/media-picker.component';
import { MediaService } from '../../core/data/media.service';
import { NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';

function slugify(s:string){ return s.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/(^-|-$)/g,''); }

@Component({
  selector: 'app-course-edit',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, MediaPickerComponent, NgIf],
  template: `
  <div class="max-w-3xl mx-auto space-y-4">
    <h1 class="text-2xl font-semibold">{{id()? 'Editar Curso' : 'Nuevo Curso'}}</h1>
    <form [formGroup]="form" (ngSubmit)="save()" class="card p-4 space-y-4 max-w-full">
      <div *ngIf="translationsReady()" class="text-xs inline-flex items-center gap-2 px-2 py-1 rounded bg-emerald-50 text-emerald-700">
        Traducciones listas ✓
      </div>
      <div class="grid gap-3 md:grid-cols-2">
        <label class="block">Idioma
          <select class="w-full ui-input" formControlName="lang">
            <option value="es">es</option><option value="en">en</option><option value="pt">pt</option>
          </select>
        </label>
        <label class="block">Título
          <input class="w-full ui-input" formControlName="title" (input)="syncSlug()">
        </label>
      </div>
      <label class="block">Slug
        <input class="w-full ui-input" formControlName="slug">
      </label>
      <label class="block">Resumen
        <textarea class="w-full ui-input" rows="3" formControlName="summary"></textarea>
      </label>

      <div class="grid gap-3 md:grid-cols-3">
        <label class="block">Nivel
          <select class="w-full ui-input" formControlName="level">
            <option value="Principiante">Principiante</option>
            <option value="Intermedio">Intermedio</option>
            <option value="Avanzado">Avanzado</option>
          </select>
        </label>
        <label class="block">Duración (texto)
          <input class="w-full ui-input" type="text" formControlName="duration">
        </label>
        <label class="block">Temas (coma)
          <input class="w-full ui-input" [value]="(form.value.topics || []).join(', ')" (change)="onTopicsChange($any($event.target).value)">
        </label>
      </div>

      <div class="space-y-2">
        <div class="font-medium flex items-center justify-between">
          <span>Recursos</span>
          <button class="btn" type="button" (click)="openResourceDialog()">Añadir recurso</button>
        </div>
        <div class="space-y-2" formArrayName="resources">
          <div class="grid md:grid-cols-3 gap-2 items-center" *ngFor="let r of resources().controls; let i=index" [formGroupName]="i">
            <div class="text-sm truncate">
              <strong>{{ r.value.title || r.value.name || r.value.type }}</strong>
              <div class="muted truncate">{{ r.value.url }}</div>
            </div>
            <div class="text-xs">{{ r.value.type }}</div>
            <button class="btn" type="button" (click)="removeResource(i)">Quitar</button>
          </div>
        </div>
        <div class="flex items-center gap-3" *ngIf="uploading()">
          <span class="text-sm text-[var(--muted)]">Subiendo… {{progress()}}%</span>
          <span *ngIf="error()" class="text-sm text-red-500">{{error()}}</span>
        </div>
      </div>

      <div class="grid gap-3 md:grid-cols-2">
        <label class="block">Estado
          <select class="w-full ui-input" formControlName="status">
            <option>draft</option><option>published</option><option>scheduled</option>
          </select>
        </label>
        <label class="block">Fecha publicación
          <input class="w-full ui-input" type="datetime-local" formControlName="publishedAtLocal">
        </label>
      </div>

      <!-- Programa Académico -->
      <div formArrayName="modules" class="space-y-3">
        <h3 class="text-lg font-medium">Programa Académico</h3>
        <div *ngFor="let module of modules.controls; let i = index" [formGroupName]="i" class="p-4 my-2 border rounded">
          <input formControlName="title" placeholder="Título del Módulo" class="w-full ui-input mb-2">
          <button class="btn" type="button" (click)="removeModule(i)">Eliminar Módulo</button>

          <div formArrayName="lessons" class="mt-3 space-y-2">
            <div *ngFor="let lesson of lessons(i).controls; let j = index" class="flex items-center gap-2">
              <input [formControlName]="j" placeholder="Lección" class="w-full ui-input">
              <button class="btn" type="button" (click)="removeLesson(i, j)">X</button>
            </div>
            <button class="btn" type="button" (click)="addLesson(i)">Añadir Lección</button>
          </div>
        </div>
        <button class="btn" type="button" (click)="addModule()">Añadir Módulo</button>
      </div>

      <div class="grid md:grid-cols-2 gap-4">
        <button class="btn btn-primary" type="submit" [disabled]="uploading()">Guardar</button>
        <button class="btn" type="button" (click)="goBack()">Volver</button>
      </div>
    </form>

    <!-- Mini diálogo añadir recurso -->
    <div *ngIf="showResDlg()" class="fixed inset-0 bg-black/40 grid place-items-center p-4">
      <div class="card max-w-md w-full p-4 text-sm">
        <div class="flex items-center justify-between mb-2">
          <div class="font-medium">Añadir recurso</div>
          <button class="btn" type="button" (click)="closeResourceDialog()">×</button>
        </div>
        <div class="grid gap-2">
          <label>Nombre visible
            <input class="w-full ui-input" [(ngModel)]="resName" />
          </label>
          <label>Tipo
            <select class="w-full ui-input" [(ngModel)]="resKind">
              <option value="video">video</option>
              <option value="pdf">pdf</option>
              <option value="zip">zip</option>
              <option value="link">link</option>
            </select>
          </label>
          <ng-container *ngIf="resKind !== 'link'; else linkTpl">
            <label>Archivo
              <input class="w-full ui-input" type="file" (change)="onPickResFile($event)" />
            </label>
          </ng-container>
          <ng-template #linkTpl>
            <label>URL
              <input class="w-full ui-input" [(ngModel)]="resUrl" />
            </label>
          </ng-template>
          <div class="flex justify-end gap-2 mt-2">
            <button class="btn" type="button" (click)="closeResourceDialog()">Cancelar</button>
            <button class="btn btn-primary" type="button" (click)="confirmResource()" [disabled]="uploading()">Añadir</button>
          </div>
        </div>
      </div>
    </div>

    <div class="card p-4">
      <h2 class="text-xl font-semibold mb-2">Media</h2>
      <app-media-picker (chosen)="attachMedia($event)"></app-media-picker>

      <div class="mt-3">
        <h3 class="font-medium mb-2">Adjuntos</h3>
        <div class="grid gap-2">
          <div *ngFor="let m of attached" class="flex items-center justify-between text-sm">
            <span class="truncate">{{m.fileName || m.path}}</span>
            <a class="btn" [href]="m.url" target="_blank">Ver</a>
          </div>
        </div>
      </div>
    </div>
  </div>
  `,
})
export class CourseEditComponent implements OnInit, OnDestroy {
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private courses = inject(CoursesService);
  private media = inject(MediaService);

  id = signal<string | null>(null);
  private readonly unsubscribe$ = new Subject<void>();

  form = this.fb.group({
    lang: ['es', Validators.required],
    title: ['', Validators.required],
    slug: [''],
    summary: [''],
    level: ['Principiante'],
    duration: [''],
    topics: [[] as string[]],
    resources: this.fb.array([] as any[]),
    media: this.fb.array([] as any[]),
    status: ['draft'],
    publishedAt: [Date.now()],
    publishedAtLocal: [''],
    modules: this.fb.array([] as any[]),
  });

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.id.set(id);
      this.courses
        .get(id)
        .pipe(takeUntil(this.unsubscribe$))
        .subscribe(c => {
          if (c) {
            const value: any = c;
            this.form.patchValue({
              ...value,
              publishedAtLocal: new Date(value.publishedAt || Date.now()).toISOString().slice(0, 16)
            });
            this.setResources(value.resources || []);
            this.setModules((value as any).modules || []);
            this.translationsReady.set(!!(value as any)?.translations?.en && !!(value as any)?.translations?.pt);
          }
        });
    }
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  resources(){ return this.form.get('resources') as unknown as FormArray<any>; }
  setResources(resources: Array<{type:string; url:string; title?:string}>){
    const fa = this.fb.array([] as any[]) as unknown as FormArray<any>;
    for(const r of resources){ fa.push(this.fb.group({ type:[r.type], url:[r.url], title:[r.title || ''] }) as any); }
    this.form.setControl('resources', fa as any);
  }
  addResource(){ this.resources().push(this.fb.group({ type:['file'], url:[''], title:[''] }) as any); }
  removeResource(i: number){ this.resources().removeAt(i); }

  // Modules (Programa académico)
  get modules(): FormArray { return this.form.get('modules') as unknown as FormArray; }
  private createModuleGroup(data?: any): FormGroup {
    return this.fb.group({
      title: [data?.title || '', Validators.required],
      lessons: this.fb.array((data?.lessons?.length ? data.lessons : ['']).map((l:string)=> this.fb.control(l, Validators.required)))
    });
  }
  setModules(mods: Array<{ title: string; lessons: string[] }>) {
    const arr = this.fb.array([]) as unknown as FormArray;
    for (const m of mods) arr.push(this.createModuleGroup(m));
    if (mods.length === 0) arr.push(this.createModuleGroup());
    this.form.setControl('modules', arr as any);
  }
  addModule(): void { this.modules.push(this.createModuleGroup()); }
  removeModule(index: number): void { this.modules.removeAt(index); }
  lessons(moduleIndex: number): FormArray { return this.modules.at(moduleIndex).get('lessons') as FormArray; }
  addLesson(moduleIndex: number): void { this.lessons(moduleIndex).push(this.fb.control('', Validators.required)); }
  removeLesson(moduleIndex: number, lessonIndex: number): void { this.lessons(moduleIndex).removeAt(lessonIndex); }

  // Subida de recurso directo con progreso, y push al FormArray
  uploading = signal(false);
  progress = signal(0);
  error = signal<string|null>(null);

  translationsReady = signal(false);
  // Mini-dialogo recurso
  showResDlg = signal(false);
  resKind: 'video'|'pdf'|'zip'|'link' = 'pdf';
  resName = '';
  resUrl = '';
  resFile?: File;

  openResourceDialog(){ this.showResDlg.set(true); this.resKind='pdf'; this.resName=''; this.resUrl=''; this.resFile=undefined; }
  closeResourceDialog(){ this.showResDlg.set(false); }
  onPickResFile(e: any){ const f = e.target?.files?.[0] as File|undefined; if(f) { this.resFile = f; this.resName ||= f.name; } }
  async confirmResource(){
    this.error.set(null);
    const createdAt = Date.now();
    try{
      if(this.resKind === 'link'){
        if(!this.resUrl) throw new Error('URL requerida');
        this.resources().push(this.fb.group({ type:['link'], url:[this.resUrl], title:[this.resName||'Link'], name:[this.resName||'Link'], size:[null], createdAt:[createdAt] }) as any);
      } else {
        const file = this.resFile;
        if(!file) throw new Error('Archivo requerido');
        this.uploading.set(true);
        const up = await this.media.upload(file, 'courses', p => this.progress.set(p));
        const type = guessType(up.contentType);
        this.resources().push(this.fb.group({ type:[type], url:[up.url], title:[this.resName||file.name], name:[file.name], size:[up.size], path:[up.path], createdAt:[createdAt] }) as any);
      }
      this.closeResourceDialog();
    }catch(err:any){
      this.error.set(err?.message || 'Error al añadir recurso');
    }finally{
      this.uploading.set(false);
      this.progress.set(0);
    }
  }

  onTopicsChange(v: string){
    const topics = (v || '').split(',').map(x=>x.trim()).filter(Boolean);
    this.form.patchValue({ topics });
  }

  syncSlug(){ const t = this.form.value.title || ''; this.form.patchValue({ slug: slugify(t as string) }, {emitEvent:false}); }

  async save(){
    const v:any = this.form.value;
    if(v.publishedAtLocal){ v.publishedAt = new Date(v.publishedAtLocal).getTime(); delete v.publishedAtLocal; }
    if(this.id()) await this.courses.update(this.id()!, v); else await this.courses.create(v);
    this.router.navigate(['/admin/courses']);
  }

  goBack(){ this.router.navigate(['/admin/courses']); }

  attached: any[] = [];
  attachMedia(m:any){
    this.attached.push(m);
    const current = (this.form.value as any).media || [];
    const type = guessType(m.contentType);
    (this.form.get('media') as any).patchValue([ ...current, { type, url: m.url, title: m.fileName } ]);
  }
}

function guessType(ct:string){ if(ct?.includes('pdf')) return 'pdf'; if(ct?.includes('image')) return 'image'; if(ct?.includes('video')) return 'video'; return 'file'; }

