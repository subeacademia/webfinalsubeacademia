import { Component, ElementRef, HostListener, Inject, NgZone, OnDestroy, OnInit, PLATFORM_ID, ViewChild } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import * as THREE from 'three';
import { Line2 } from 'three/examples/jsm/lines/Line2.js';
import { LineMaterial } from 'three/examples/jsm/lines/LineMaterial.js';
import { LineGeometry } from 'three/examples/jsm/lines/LineGeometry.js';
import { ThemeService } from '../../../shared/theme.service';

@Component({
  selector: 'app-elegant-network-scene',
  standalone: true,
  template: '<canvas #canvas class="w-full h-full block"></canvas>'
})
export class ElegantNetworkSceneComponent implements OnInit, OnDestroy {
  @ViewChild('canvas', { static: true }) private canvasRef!: ElementRef<HTMLCanvasElement>;

  private scene!: THREE.Scene;
  private camera!: THREE.PerspectiveCamera;
  private renderer!: THREE.WebGLRenderer;
  private frameId: number | null = null;
  private time = 0;

  private group!: THREE.Group;
  private lines: Line2[] = [];
  private materials: LineMaterial[] = [];

  private dark = {
    bg: 0x0b0f1a,
    line: 0x75a7ff,
    node: 0xffffff
  };
  private light = {
    bg: 0xffffff,
    line: 0x9aa7bf,
    node: 0x3b82f6
  };

  constructor(private zone: NgZone, private theme: ThemeService, @Inject(PLATFORM_ID) private platformId: object) {}

  ngOnInit(): void {
    if (!isPlatformBrowser(this.platformId)) return;
    this.initScene();
    this.createElegantNetwork();
    this.start();
  }

  ngOnDestroy(): void {
    cancelAnimationFrame(this.frameId || 0);
    this.materials.forEach(m => m.dispose());
    this.renderer?.dispose();
  }

  private initScene(): void {
    const canvas = this.canvasRef.nativeElement;
    const w = window.innerWidth, h = window.innerHeight;
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(55, w / h, 1, 2000);
    this.camera.position.set(0, 0, 260);
    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    this.renderer.setSize(w, h);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.group = new THREE.Group();
    this.group.rotation.x = -0.18;
    this.scene.add(this.group);
  }

  private palette() { return this.theme.current() === 'dark' ? this.dark : this.light; }

  private createElegantNetwork(): void {
    const p = this.palette();
    // Nodos en círculos concéntricos con simetría
    const rings = 7;
    const perRing = 32;
    const baseR = Math.min(window.innerWidth, window.innerHeight) * 0.22;
    const nodes: THREE.Vector3[] = [];
    for (let r = 0; r < rings; r++) {
      const radius = baseR * (0.25 + r / (rings - 1));
      const z = -r * 18;
      for (let i = 0; i < perRing; i++) {
        const a = (i / perRing) * Math.PI * 2;
        nodes.push(new THREE.Vector3(radius * Math.cos(a), radius * Math.sin(a), z));
      }
    }

    // Conexiones suaves: anillos y radios alternos
    const addLine = (a: THREE.Vector3, b: THREE.Vector3, alpha: number) => {
      const geom = new LineGeometry();
      geom.setPositions([a.x, a.y, a.z, b.x, b.y, b.z]);
      const mat = new LineMaterial({
        color: p.line,
        linewidth: 0.0028 * Math.min(window.devicePixelRatio, 2) * 800,
        transparent: true,
        opacity: 0.15 + 0.55 * alpha,
        dashed: false,
        depthWrite: false
      });
      mat.resolution.set(window.innerWidth, window.innerHeight);
      const line = new Line2(geom, mat);
      this.group.add(line);
      this.lines.push(line);
      this.materials.push(mat);
    };

    // Anillos
    for (let r = 0; r < rings; r++) {
      for (let i = 0; i < perRing; i++) {
        const a = r * perRing + i;
        const b = r * perRing + ((i + 1) % perRing);
        addLine(nodes[a], nodes[b], r / rings);
      }
    }
    // Radios
    for (let i = 0; i < perRing; i++) {
      for (let r = 0; r < rings - 1; r++) {
        const a = r * perRing + i;
        const b = (r + 1) * perRing + i;
        addLine(nodes[a], nodes[b], 0.4 + 0.6 * (r / (rings - 1)));
      }
    }

    // Nodos discretos (pequeños) para elegancia
    const nodeGeom = new THREE.SphereGeometry(1.1, 10, 10);
    const nodeMat = new THREE.MeshBasicMaterial({ color: p.node, opacity: 0.35, transparent: true });
    for (const n of nodes) {
      const m = new THREE.Mesh(nodeGeom, nodeMat);
      m.position.copy(n);
      this.group.add(m);
    }
  }

  private start(): void {
    this.zone.runOutsideAngular(() => {
      const tick = () => {
        this.frameId = requestAnimationFrame(tick);
        this.time += 0.016;
        // Animación elegante: respiración y aparición/desaparición por barrido
        const sweep = (Math.sin(this.time * 0.6) + 1) / 2; // 0..1
        this.lines.forEach((ln, idx) => {
          const mat = ln.material as LineMaterial;
          const base = 0.18 + 0.5 * sweep;
          mat.opacity = base * (0.6 + 0.4 * Math.sin(this.time * 0.5 + idx * 0.15));
          mat.needsUpdate = true;
        });
        this.group.rotation.z += 0.0009; // giro muy sutil
        this.renderer.render(this.scene, this.camera);
      };
      tick();
    });
  }

  @HostListener('window:resize')
  onResize() {
    if (!this.renderer) return;
    const w = window.innerWidth, h = window.innerHeight;
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(w, h);
    this.materials.forEach(m => m.resolution.set(w, h));
  }
}


