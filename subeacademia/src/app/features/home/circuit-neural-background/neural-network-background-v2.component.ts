import { Component, ElementRef, HostListener, Inject, Input, NgZone, OnDestroy, OnInit, PLATFORM_ID, ViewChild } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import * as THREE from 'three';
import { ThemeService } from '../../../shared/theme.service';
import { Subscription } from 'rxjs';

type Density = 'low' | 'medium' | 'high';

@Component({
  selector: 'app-neural-network-background-v2',
  standalone: true,
  templateUrl: './neural-network-background-v2.component.html',
  styleUrls: ['./neural-network-background-v2.component.scss']
})
export class NeuralNetworkBackgroundV2Component implements OnInit, OnDestroy {
  @ViewChild('canvas', { static: true }) private canvasRef!: ElementRef<HTMLCanvasElement>;

  @Input() animationDurationCreate: number = 2000;
  @Input() animationDurationDestroy: number = 1000;
  @Input() nodeColor: string = '#00FFFF';
  @Input() lineColor: string = '#00BFFF';
  @Input() backgroundColor: string = 'transparent';
  @Input() density: Density = 'medium';
  @Input() glowEffect: boolean = true;
  @Input() flowSpeed: number = 1.0; // 0.1 - 2.0

  private scene!: THREE.Scene;
  private camera!: THREE.PerspectiveCamera;
  private renderer!: THREE.WebGLRenderer;
  private group!: THREE.Group;
  private frameId: number | null = null;
  private isDestroying = false;
  private start = 0;

  // Recursos
  private nodeMeshes: THREE.Mesh[] = [];
  private lineMeshes: THREE.Line[] = [];
  private flowParticles: THREE.Points[] = [];
  private lineMaterials: THREE.LineBasicMaterial[] = [];
  private pointMaterials: THREE.PointsMaterial[] = [];

  private themeSub?: Subscription;

  constructor(private zone: NgZone, @Inject(PLATFORM_ID) private platformId: object, private theme: ThemeService) {}

  ngOnInit(): void {
    if (!isPlatformBrowser(this.platformId)) return;
    this.initScene();
    this.buildNetwork();
    this.playIntro();
    // Reaccionar al cambio de tema para alternar fondo oscuro/claro
    this.themeSub = this.theme.isDarkTheme$.subscribe(isDark => {
      if (!this.renderer) return;
      // Ajustar fondo y visibilidad de líneas según tema
      this.applyTheme(isDark);
    });
  }

  ngOnDestroy(): void {
    if (!isPlatformBrowser(this.platformId)) return;
    this.isDestroying = true;
    const endAt = performance.now() + this.animationDurationDestroy;
    const out = () => {
      if (performance.now() < endAt) {
        requestAnimationFrame(out);
        const t = 1 - (endAt - performance.now()) / this.animationDurationDestroy;
        const ease = t * t * (3 - 2 * t);
        this.group.scale.setScalar(1 - 0.25 * ease);
        this.setOpacity(1 - ease);
        this.render();
      } else {
        cancelAnimationFrame(this.frameId || 0);
        // Liberar recursos
        this.nodeMeshes.forEach(m => m.geometry.dispose());
        this.lineMeshes.forEach(l => l.geometry.dispose());
        this.flowParticles.forEach(p => p.geometry.dispose());
        this.themeSub?.unsubscribe();
        (this.renderer as any)?.dispose?.();
      }
    };
    out();
  }

  private initScene(): void {
    const w = window.innerWidth; const h = window.innerHeight;
    const canvas = this.canvasRef.nativeElement;
    this.scene = new THREE.Scene();
    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    this.renderer.setSize(w, h);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    const isTransparent = (this.backgroundColor || '').toLowerCase() === 'transparent';
    this.renderer.setClearColor(new THREE.Color(isTransparent ? '#000000' : this.backgroundColor), isTransparent ? 0 : 1);
    this.camera = new THREE.PerspectiveCamera(60, w / h, 1, 3000);
    this.camera.position.set(0, 0, 420);
    this.group = new THREE.Group();
    this.scene.add(this.group);
  }

  private buildNetwork(): void {
    const densityMap: Record<Density, { nodes: number; flows: number }> = {
      low: { nodes: 250, flows: 150 },
      medium: { nodes: 500, flows: 300 },
      high: { nodes: 800, flows: 450 }
    };
    const { nodes, flows } = densityMap[this.density];

    // Paleta
    const nodeCol = new THREE.Color(this.nodeColor);
    const lineCol = new THREE.Color(this.lineColor);

    // Nodos con glow opcional
    const nodeGeom = new THREE.SphereGeometry(2.1, 12, 12);
    const baseMat = new THREE.MeshBasicMaterial({ color: nodeCol, transparent: true, opacity: 0 });
    for (let i = 0; i < nodes; i++) {
      const v = this.randomInVolume();
      const m = new THREE.Mesh(nodeGeom, baseMat.clone());
      m.position.copy(v);
      if (this.glowEffect) {
        const glow = new THREE.Sprite(new THREE.SpriteMaterial({ color: nodeCol, transparent: true, opacity: 0, blending: THREE.AdditiveBlending }));
        glow.scale.set(10, 10, 1);
        glow.position.copy(v);
        this.group.add(glow);
      }
      this.group.add(m);
      this.nodeMeshes.push(m);
    }

    // Líneas direccionales
    const lineMat = new THREE.LineBasicMaterial({ color: lineCol, transparent: true, opacity: 0.0, blending: THREE.AdditiveBlending });
    const linesPerNode = 2;
    for (let i = 0; i < nodes; i++) {
      for (let k = 0; k < linesPerNode; k++) {
        const a = this.nodeMeshes[i].position;
        const b = this.randomInVolume();
        const g = new THREE.BufferGeometry().setFromPoints([a.clone(), b.clone()]);
        const lm = lineMat.clone();
        const l = new THREE.Line(g, lm);
        this.group.add(l);
        this.lineMeshes.push(l);
        this.lineMaterials.push(lm);
      }
    }

    // Flujos de energía (partículas moviéndose a lo largo de líneas)
    const flowGeom = new THREE.BufferGeometry();
    const flowPositions = new Float32Array(flows * 3);
    for (let i = 0; i < flows; i++) {
      const p = this.randomInVolume();
      flowPositions[i * 3 + 0] = p.x;
      flowPositions[i * 3 + 1] = p.y;
      flowPositions[i * 3 + 2] = p.z;
    }
    flowGeom.setAttribute('position', new THREE.BufferAttribute(flowPositions, 3));
    const flowMat = new THREE.PointsMaterial({ color: lineCol, size: 2.4, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false });
    const flowsPoints = new THREE.Points(flowGeom, flowMat);
    this.group.add(flowsPoints);
    this.flowParticles.push(flowsPoints);
    this.pointMaterials.push(flowMat);
  }

  private randomInVolume(): THREE.Vector3 {
    // Caja 3D
    const w = Math.min(window.innerWidth, 1400) * 0.8;
    const h = Math.min(window.innerHeight, 800) * 0.6;
    const d = 600;
    return new THREE.Vector3(
      (Math.random() - 0.5) * w,
      (Math.random() - 0.5) * h,
      (Math.random() - 0.5) * d
    );
  }

  private playIntro(): void {
    this.start = performance.now();
    const duration = this.animationDurationCreate;
    const intro = () => {
      const now = performance.now();
      const t = Math.min(1, (now - this.start) / duration);
      const ease = t * t * (3 - 2 * t);
      this.setOpacity(ease);
      this.group.scale.setScalar(0.8 + 0.2 * ease);
      this.group.rotation.y = (1 - ease) * 0.3;
      this.render();
      if (t < 1 && !this.isDestroying) requestAnimationFrame(intro);
      else if (!this.isDestroying) this.loop();
    };
    requestAnimationFrame(intro);
  }

  private applyTheme(isDark: boolean): void {
    // Fondo transparente para que herede el del sitio, pero ajustamos blending/opacity
    const isTransparent = (this.backgroundColor || '').toLowerCase() === 'transparent';
    const bg = isDark ? (isTransparent ? '#000000' : this.backgroundColor) : '#FFFFFF';
    this.renderer?.setClearColor(new THREE.Color(bg), isTransparent ? 0 : 1);
    // Líneas y partículas: en light usamos blending normal y más opacidad; en dark, aditivo y menos opacidad
    const lineOpacity = isDark ? 0.45 : 0.8;
    const pointOpacity = isDark ? 0.6 : 0.9;
    const lineBlend = isDark ? THREE.AdditiveBlending : THREE.NormalBlending;
    const pointBlend = isDark ? THREE.AdditiveBlending : THREE.NormalBlending;
    this.lineMaterials.forEach(m => { m.blending = lineBlend; m.opacity = lineOpacity; m.needsUpdate = true; });
    this.pointMaterials.forEach(m => { m.blending = pointBlend; m.opacity = pointOpacity; m.needsUpdate = true; });
  }

  private loop(): void {
    const tick = () => {
      if (this.isDestroying) return;
      const t = performance.now() * 0.001 * this.flowSpeed;
      // Pulsos y rotación suave de la red
      for (let i = 0; i < this.nodeMeshes.length; i++) {
        const m = this.nodeMeshes[i];
        const s = 0.9 + 0.2 * (0.5 + 0.5 * Math.sin(t + i * 0.37));
        m.scale.setScalar(s);
      }
      this.group.rotation.y += 0.0008 * this.flowSpeed;
      this.group.rotation.x = 0.05 * Math.sin(t * 0.7);

      // Mover partículas
      for (const pts of this.flowParticles) {
        const pos = pts.geometry.getAttribute('position') as THREE.BufferAttribute;
        for (let i = 0; i < pos.count; i++) {
          const z = pos.getZ(i) + (1.5 + Math.sin(t + i) * 0.5) * 2.0 * this.flowSpeed;
          pos.setZ(i, z > 300 ? -300 : z);
        }
        pos.needsUpdate = true;
      }
      this.render();
      this.frameId = requestAnimationFrame(tick);
    };
    this.frameId = requestAnimationFrame(tick);
  }

  private setOpacity(alpha: number): void {
    for (const m of this.nodeMeshes) (m.material as THREE.MeshBasicMaterial).opacity = 0.6 * alpha;
    for (const l of this.lineMeshes) (l.material as THREE.LineBasicMaterial).opacity = 0.45 * alpha;
    for (const f of this.flowParticles) (f.material as THREE.PointsMaterial).opacity = 0.6 * alpha;
  }

  private render(): void { this.renderer.render(this.scene, this.camera); }

  @HostListener('window:resize') onResize(): void {
    if (!this.renderer) return;
    const w = window.innerWidth; const h = window.innerHeight;
    this.camera.aspect = w / h; this.camera.updateProjectionMatrix();
    this.renderer.setSize(w, h);
  }
}


