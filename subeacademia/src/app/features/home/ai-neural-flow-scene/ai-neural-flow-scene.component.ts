import { Component, ElementRef, HostListener, Inject, NgZone, OnDestroy, OnInit, PLATFORM_ID, ViewChild } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import * as THREE from 'three';
import { Line2 } from 'three/examples/jsm/lines/Line2.js';
import { LineMaterial } from 'three/examples/jsm/lines/LineMaterial.js';
import { LineGeometry } from 'three/examples/jsm/lines/LineGeometry.js';

@Component({
  selector: 'app-ai-neural-flow-scene',
  standalone: true,
  template: '<canvas #canvas class="w-full h-full block"></canvas>'
})
export class AiNeuralFlowSceneComponent implements OnInit, OnDestroy {
  @ViewChild('canvas', { static: true }) private canvasRef!: ElementRef<HTMLCanvasElement>;
  private scene!: THREE.Scene;
  private camera!: THREE.PerspectiveCamera;
  private renderer!: THREE.WebGLRenderer;
  private frameId: number | null = null;
  private time = 0;

  private group!: THREE.Group;
  private lines: Line2[] = [];
  private materials: LineMaterial[] = [];
  private dir = 1; // 1 expande, -1 contrae

  ngOnInit(): void {
    if (!isPlatformBrowser(this.platformId)) return;
    this.initScene();
    this.createNeuralFlow();
    this.start();
  }

  constructor(private zone: NgZone, @Inject(PLATFORM_ID) private platformId: object) {}

  ngOnDestroy(): void {
    cancelAnimationFrame(this.frameId || 0);
    this.materials.forEach(m => m.dispose());
    this.renderer?.dispose();
  }

  private initScene(): void {
    const canvas = this.canvasRef.nativeElement;
    const w = window.innerWidth, h = window.innerHeight;
    this.scene = new THREE.Scene();
    // Canvas transparente para respetar light/dark del sitio
    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    this.renderer.setClearColor(0x000000, 0);
    this.camera = new THREE.PerspectiveCamera(60, w / h, 1, 2000);
    this.camera.position.set(0, 0, 300);
    this.renderer.setSize(w, h);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.group = new THREE.Group();
    this.group.position.set(0, 0, 0);
    this.scene.add(this.group);
  }

  private createNeuralFlow(): void {
    // Versión simplificada, más limpia y de pantalla completa
    const fanCount = 2; // menos abanicos para mayor claridad
    const viewH = window.innerHeight;
    const fanSpacing = Math.max(120, viewH * 0.22);
    const leftX = -window.innerWidth * 0.40;
    const centerX = -10;
    const colors = [0x2563eb, 0xf59e0b];

    const addLine = (a: THREE.Vector3, b: THREE.Vector3, color: number, opacity: number) => {
      const g = new LineGeometry();
      g.setPositions([a.x, a.y, a.z, b.x, b.y, b.z]);
      const m = new LineMaterial({ color, linewidth: 1.8, transparent: true, opacity, depthWrite: false });
      m.resolution.set(window.innerWidth, window.innerHeight);
      const l = new Line2(g, m);
      this.group.add(l);
      this.lines.push(l);
      this.materials.push(m);
    };

    // Abanicos de entrada
    for (let f = 0; f < fanCount; f++) {
      const baseY = (f - (fanCount - 1) / 2) * fanSpacing;
      const origin = new THREE.Vector3(leftX, baseY, 0);
      for (let i = 0; i < 14; i++) {
        const t = i / 27;
        const target = new THREE.Vector3(centerX, baseY + (t - 0.5) * fanSpacing * 1.2, -t * 80);
        const c = colors[f % colors.length];
        addLine(origin, target, c, 0.5 + 0.2 * (1 - t));
      }
    }

    // Salida hacia la derecha en columnas
    const rightStart = centerX + 4;
    const columns = 16;
    const rows = 12; // menos filas para que no se vea tan "adjunto"
    const stepX = (window.innerWidth * 0.55) / columns;
    const totalHeight = viewH * 0.8;
    const yTop = totalHeight / 2;
    const stepY = totalHeight / Math.max(1, rows - 1);
    for (let c = 0; c < columns; c++) {
      for (let r = 0; r < rows; r++) {
        const y = yTop - r * stepY - totalHeight / 2; // centrar
        const a = new THREE.Vector3(rightStart, y, -c * 10);
        const b = new THREE.Vector3(rightStart + stepX * 0.95, y, -c * 10);
        addLine(a, b, 0x2563eb, 0.22);
      }
    }
  }

  private start(): void {
    this.zone.runOutsideAngular(() => {
      const tick = () => {
        this.frameId = requestAnimationFrame(tick);
        this.time += 0.016;
        // Ciclo más rápido de construcción/destrucción (≈2.2s)
        const cycle = 2.2;
        const phase = (this.time % cycle) / cycle; // 0..1
        const t = phase < 0.5 ? (phase / 0.5) : (1 - (phase - 0.5) / 0.5); // 0->1->0
        const ease = t * t * (3 - 2 * t); // easeInOut

        this.lines.forEach((ln, idx) => {
          const mat = ln.material as LineMaterial;
          const base = 0.18 + 0.7 * ease;
          mat.opacity = base;
          mat.needsUpdate = true;
        });
        // Escalado horizontal para dar sensación de formación completa y retracción
        const scale = 0.6 + 0.6 * ease;
        this.group.scale.set(scale, 1, 1);
        this.renderer.render(this.scene, this.camera);
      };
      tick();
    });
  }

  @HostListener('window:resize') onResize(){
    if (!this.renderer) return;
    const w = window.innerWidth, h = window.innerHeight;
    this.camera.aspect = w / h; this.camera.updateProjectionMatrix();
    this.renderer.setSize(w, h);
    this.materials.forEach(m => m.resolution.set(w, h));
  }
}


