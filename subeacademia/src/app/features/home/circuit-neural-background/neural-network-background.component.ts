import { Component, ElementRef, HostListener, Inject, Input, NgZone, OnDestroy, OnInit, PLATFORM_ID, ViewChild } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import * as THREE from 'three';

type Density = 'low' | 'medium' | 'high';

@Component({
  selector: 'app-neural-network-background',
  standalone: true,
  templateUrl: './neural-network-background.component.html',
  styleUrls: ['neural-network-background.component.scss']
})
export class NeuralNetworkBackgroundComponent implements OnInit, OnDestroy {
  @ViewChild('canvas', { static: true }) private canvasRef!: ElementRef<HTMLCanvasElement>;

  // Inputs configurables
  @Input() animationDurationCreate: number = 1800;
  @Input() animationDurationDestroy: number = 1200;
  @Input() nodeColor: string = '#7aa7ff';
  @Input() lineColor: string = '#9fb7e8';
  @Input() backgroundColor: string = '#ffffff';
  @Input() density: Density = 'medium';

  private scene!: THREE.Scene;
  private camera!: THREE.PerspectiveCamera;
  private renderer!: THREE.WebGLRenderer;
  private group!: THREE.Group;
  private frameId: number | null = null;
  private startTime = 0;
  private isDestroying = false;

  // Recursos
  private nodes: THREE.Mesh[] = [];
  private lines: THREE.LineSegments[] = [];

  constructor(private zone: NgZone, @Inject(PLATFORM_ID) private platformId: object) {}

  ngOnInit(): void {
    if (!isPlatformBrowser(this.platformId)) return;
    this.initScene();
    this.createNetwork();
    this.playCreateAnimation();
  }

  ngOnDestroy(): void {
    if (!isPlatformBrowser(this.platformId)) return;
    // Animación de salida y cleanup diferido
    this.isDestroying = true;
    const endAt = performance.now() + this.animationDurationDestroy;
    const cleanup = () => {
      if (performance.now() < endAt) {
        requestAnimationFrame(cleanup);
        const t = 1 - (endAt - performance.now()) / this.animationDurationDestroy;
        const ease = t * t * (3 - 2 * t);
        this.setGlobalOpacity(1 - ease);
        this.group.scale.setScalar(1 - 0.2 * ease);
        this.render();
      } else {
        cancelAnimationFrame(this.frameId || 0);
        this.dispose();
      }
    };
    cleanup();
  }

  private dispose(): void {
    this.nodes.forEach(m => m.geometry.dispose());
    this.lines.forEach(l => l.geometry.dispose());
    (this.renderer as any)?.dispose?.();
  }

  private initScene(): void {
    const w = window.innerWidth; const h = window.innerHeight;
    const canvas = this.canvasRef.nativeElement;
    this.scene = new THREE.Scene();
    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    this.renderer.setSize(w, h);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    // Canvas transparente; el color de fondo lo pone la página (dark/light)
    this.renderer.setClearColor(new THREE.Color(this.backgroundColor), 0);

    this.camera = new THREE.PerspectiveCamera(60, w / h, 1, 2000);
    this.camera.position.set(0, 0, 340);
    this.group = new THREE.Group();
    this.group.rotation.x = -0.12; // sutil perspectiva
    this.scene.add(this.group);
  }

  private createNetwork(): void {
    // Densidad
    const densityMap: Record<Density, number> = { low: 120, medium: 220, high: 360 };
    const nodeCount = densityMap[this.density];

    // Nodos distribuidos irregularmente (espiral+jitter)
    const nodeGeom = new THREE.SphereGeometry(1.3, 8, 8);
    const nodeMat = new THREE.MeshBasicMaterial({ color: new THREE.Color(this.nodeColor), transparent: true, opacity: 0 });
    const positions: THREE.Vector3[] = [];
    const maxR = Math.min(window.innerWidth, window.innerHeight) * 0.42;
    for (let i = 0; i < nodeCount; i++) {
      const t = i / nodeCount;
      const angle = t * Math.PI * 6 + (Math.random() - 0.5) * 0.3; // espiral irregular
      const radius = maxR * (0.1 + 0.9 * t) + (Math.random() - 0.5) * 24;
      const x = radius * Math.cos(angle) + (Math.random() - 0.5) * 16;
      const y = radius * Math.sin(angle) + (Math.random() - 0.5) * 16;
      const z = -t * 180 + (Math.random() - 0.5) * 30;
      const m = new THREE.Mesh(nodeGeom, nodeMat.clone());
      m.position.set(x, y, z);
      this.group.add(m);
      this.nodes.push(m);
      positions.push(new THREE.Vector3(x, y, z));
    }

    // Conexiones
    const lineMat = new THREE.LineBasicMaterial({ color: new THREE.Color(this.lineColor), transparent: true, opacity: 0.0 });
    const lineGeom = new THREE.BufferGeometry();
    const linePositions: number[] = [];
    // conectar cada punto con 2-3 vecinos cercanos para red minimalista
    for (let i = 0; i < nodeCount; i++) {
      const k = 2 + Math.floor(Math.random() * 2);
      const neighbors = this.findNearest(positions, i, k);
      for (const nb of neighbors) {
        const a = positions[i];
        const b = positions[nb];
        linePositions.push(a.x, a.y, a.z, b.x, b.y, b.z);
      }
    }
    lineGeom.setAttribute('position', new THREE.Float32BufferAttribute(new Float32Array(linePositions), 3));
    const segs = new THREE.LineSegments(lineGeom, lineMat);
    this.group.add(segs);
    this.lines.push(segs);
  }

  private findNearest(points: THREE.Vector3[], index: number, k: number): number[] {
    const base = points[index];
    const pairs: Array<{ idx: number; d: number }> = [];
    for (let i = 0; i < points.length; i++) {
      if (i === index) continue;
      const d = base.distanceToSquared(points[i]);
      pairs.push({ idx: i, d });
    }
    pairs.sort((a, b) => a.d - b.d);
    return pairs.slice(0, k).map(p => p.idx);
  }

  private playCreateAnimation(): void {
    this.startTime = performance.now();
    const duration = this.animationDurationCreate;
    const animateIn = () => {
      const now = performance.now();
      const t = Math.min(1, (now - this.startTime) / duration);
      const ease = t * t * (3 - 2 * t);
      // Aparecer y crecer
      for (const n of this.nodes) {
        const m = n.material as THREE.MeshBasicMaterial;
        m.opacity = 0.3 + 0.5 * ease;
        n.scale.setScalar(0.6 + 0.4 * ease);
      }
      for (const l of this.lines) {
        const m = l.material as THREE.LineBasicMaterial;
        m.opacity = 0.15 + 0.35 * ease;
      }
      // parallax sutil
      this.group.rotation.z = 0.05 * Math.sin(ease * Math.PI);
      this.render();
      if (t < 1 && !this.isDestroying) requestAnimationFrame(animateIn);
      else if (!this.isDestroying) this.loop();
    };
    requestAnimationFrame(animateIn);
  }

  private loop(): void {
    // animaciones sutiles continuas
    const loopTick = () => {
      if (this.isDestroying) return;
      const time = performance.now() * 0.0015;
      for (let i = 0; i < this.nodes.length; i++) {
        const n = this.nodes[i];
        n.scale.setScalar(0.9 + 0.1 * (1 + Math.sin(time + i * 0.3)) / 2);
      }
      for (const l of this.lines) {
        const m = l.material as THREE.LineBasicMaterial;
        m.opacity = 0.18 + 0.12 * (1 + Math.sin(time * 1.3)) / 2;
      }
      this.group.rotation.z += 0.0006; // movimiento muy leve
      this.render();
      this.frameId = requestAnimationFrame(loopTick);
    };
    this.frameId = requestAnimationFrame(loopTick);
  }

  private setGlobalOpacity(alpha: number) {
    for (const n of this.nodes) (n.material as THREE.MeshBasicMaterial).opacity = 0.3 * alpha;
    for (const l of this.lines) (l.material as THREE.LineBasicMaterial).opacity = 0.3 * alpha;
  }

  private render(): void {
    this.renderer.render(this.scene, this.camera);
  }

  @HostListener('window:resize') onResize(): void {
    if (!this.renderer) return;
    const w = window.innerWidth; const h = window.innerHeight;
    this.camera.aspect = w / h; this.camera.updateProjectionMatrix();
    this.renderer.setSize(w, h);
  }
}


