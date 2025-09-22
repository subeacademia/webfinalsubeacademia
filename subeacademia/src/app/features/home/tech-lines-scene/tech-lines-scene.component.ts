import { Component, ElementRef, HostListener, Inject, NgZone, OnDestroy, OnInit, PLATFORM_ID, ViewChild } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import * as THREE from 'three';
import { ThemeService } from '../../../shared/theme.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-tech-lines-scene',
  standalone: true,
  template: '<canvas #canvas class="w-full h-full block"></canvas>',
})
export class TechLinesSceneComponent implements OnInit, OnDestroy {
  @ViewChild('canvas', { static: true }) private canvasRef!: ElementRef<HTMLCanvasElement>;

  private scene!: THREE.Scene;
  private camera!: THREE.PerspectiveCamera;
  private renderer!: THREE.WebGLRenderer;
  private frameId: number | null = null;
  private time = 0;

  // Grupos y colecciones
  private networkGroup!: THREE.Group;
  private radialGroup!: THREE.Group;
  private lines: Array<THREE.Line> = [];
  private lineLifetimes: Array<{ life: number; speed: number; dir: 1 | -1; total: number; phase: number }>=[];
  private nodePoints?: THREE.Points;
  private edges: Array<{ start: THREE.Vector3; end: THREE.Vector3 }> = [];
  private dataPackets: Array<{ mesh: THREE.Mesh; start: THREE.Vector3; end: THREE.Vector3; speed: number; phase: number }>=[];

  // Suscripciones
  private themeSubscription!: Subscription;

  // Paleta por tema
  private darkThemeColors = {
    bg: 0x0b1020,
    line: 0x60a5fa, // azul
    accent: 0x22d3ee, // cyan
    glow: 0x8b5cf6 // violeta
  };

  private lightThemeColors = {
    bg: 0xffffff,
    line: 0x94a3b8, // gris azulado sutil
    accent: 0x60a5fa,
    glow: 0xa78bfa
  };

  constructor(
    private readonly ngZone: NgZone,
    private readonly themeService: ThemeService,
    @Inject(PLATFORM_ID) private readonly platformId: object,
  ) {}

  ngOnInit(): void {
    if (!isPlatformBrowser(this.platformId)) return;

    this.initScene();
    this.createRadialSymmetricNetwork();

    // Aplicar tema actual y escuchar cambios
    this.updateTheme(this.themeService.current() === 'dark');
    this.themeSubscription = this.themeService.isDarkTheme$.subscribe(isDark => this.updateTheme(isDark));

    this.startAnimation();
  }

  ngOnDestroy(): void {
    cancelAnimationFrame(this.frameId || 0);
    this.frameId = null;
    this.themeSubscription?.unsubscribe();
    this.renderer?.dispose();
    this.lines.forEach(l => l.geometry.dispose());
    this.nodePoints?.geometry.dispose();
  }

  private initScene(): void {
    const canvas = this.canvasRef.nativeElement;
    this.scene = new THREE.Scene();

    // Ajuste de cámara para cubrir todo el hero
    const w = window.innerWidth;
    const h = window.innerHeight;
    this.camera = new THREE.PerspectiveCamera(60, w / h, 1, 2000);
    this.camera.position.set(0, 0, 220);

    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'high-performance' });
    this.renderer.setSize(w, h);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    this.networkGroup = new THREE.Group();
    this.scene.add(this.networkGroup);
    this.radialGroup = new THREE.Group();
    // ligera inclinación y centrado exacto
    this.radialGroup.rotation.x = -0.15;
    this.radialGroup.position.set(0, 0, 0);
    this.scene.add(this.radialGroup);

    // Neblina suave para profundidad
    this.scene.fog = new THREE.FogExp2(0x000000, 0.002);
  }

  private updateTheme(isDark: boolean): void {
    const palette = isDark ? this.darkThemeColors : this.lightThemeColors;
    this.renderer.setClearColor(palette.bg, 0); // transparente sobre el hero

    // Actualizar materiales existentes
    this.lines.forEach(line => {
      const mat = line.material as THREE.LineDashedMaterial;
      mat.color = new THREE.Color(palette.line);
      mat.needsUpdate = true;
    });
    if (this.nodePoints) {
      const pm = this.nodePoints.material as THREE.PointsMaterial;
      pm.color = new THREE.Color(palette.accent);
      pm.needsUpdate = true;
    }
  }

  private createRadialSymmetricNetwork(): void {
    // Limpiar si existía
    while (this.networkGroup.children.length) {
      const obj = this.networkGroup.children.pop();
      if (obj) obj.removeFromParent();
    }
    while (this.radialGroup.children.length) {
      const obj = this.radialGroup.children.pop();
      if (obj) obj.removeFromParent();
    }
    this.lines = [];
    
    // Parámetros radiales (mandala 3D)
    const rings = 6; // anillos
    const pointsPerRing = 24; // simetría circular
    const baseRadius = Math.min(window.innerWidth, window.innerHeight) * 0.18;
    const depth = 160; // profundidad total

    const positions: number[] = [];
    const nodeIndexToVector: THREE.Vector3[] = [];
    for (let r = 0; r <= rings; r++) {
      const radius = baseRadius * (0.25 + (r / rings));
      const z = -depth * (r / rings) * 0.6; // alejar anillos para 3D
      for (let i = 0; i < pointsPerRing; i++) {
        const angle = (i / pointsPerRing) * Math.PI * 2;
        const jitterR = radius * 0.04 * (Math.random() - 0.5);
        const jitterA = 0.02 * (Math.random() - 0.5);
        const a = angle + jitterA;
        const x = (radius + jitterR) * Math.cos(a);
        const y = (radius + jitterR) * Math.sin(a);
        const px = x;
        const py = y;
        const pz = z - Math.random() * 20;
        positions.push(px, py, pz);
        nodeIndexToVector.push(new THREE.Vector3(px, py, pz));
      }
    }
    const ptsGeo = new THREE.BufferGeometry();
    ptsGeo.setAttribute('position', new THREE.Float32BufferAttribute(new Float32Array(positions), 3));
    const ptsMat = new THREE.PointsMaterial({
      color: this.themeService.current() === 'dark' ? this.darkThemeColors.accent : this.lightThemeColors.accent,
      size: 2.2,
      transparent: true,
      opacity: 0.7,
      sizeAttenuation: true,
      depthWrite: false
    });
    this.nodePoints = new THREE.Points(ptsGeo, ptsMat);
    this.radialGroup.add(this.nodePoints);

    // Conexiones radiales: radios y anillos (simetría circular)
    const color = this.themeService.current() === 'dark' ? this.darkThemeColors.line : this.lightThemeColors.line;
    const totalPerRing = pointsPerRing;
    const indexFor = (ring: number, idx: number) => ring * pointsPerRing + (idx % pointsPerRing);

    for (let r = 0; r <= rings; r++) {
      // conexiones circunferenciales del anillo r
      for (let i = 0; i < totalPerRing; i++) {
        const v1 = nodeIndexToVector[indexFor(r, i)];
        const v2 = nodeIndexToVector[indexFor(r, i + 1)];
        this.addAnimatedEdge(v1.x, v1.y, v1.z, v2.x, v2.y, v2.z, color, i, totalPerRing);
      }
      // conexiones radiales hacia el anillo siguiente
      if (r < rings) {
        for (let i = 0; i < totalPerRing; i++) {
          const v1 = nodeIndexToVector[indexFor(r, i)];
          const v2 = nodeIndexToVector[indexFor(r+1, i)];
          this.addAnimatedEdge(v1.x, v1.y, v1.z, v2.x, v2.y, v2.z, color, i, totalPerRing);
        }
      }
    }
  }

  private addAnimatedEdge(x1: number, y1: number, z1: number, x2: number, y2: number, z2: number, color: number, column: number, totalCols: number): void {
    const points: THREE.Vector3[] = [];
    const segments = 20;
    for (let i = 0; i <= segments; i++) {
      const t = i / segments;
      points.push(new THREE.Vector3(
        THREE.MathUtils.lerp(x1, x2, t),
        THREE.MathUtils.lerp(y1, y2, t),
        THREE.MathUtils.lerp(z1, z2, t)
      ));
    }
    const geometry = new THREE.BufferGeometry().setFromPoints(points);
    const mat = new THREE.LineDashedMaterial({
      color,
      dashSize: 1000, // hacemos el trazo continuo; usamos drawRange para la animación
      gapSize: 1,
      transparent: true,
      opacity: 0.9
    });
    const line = new THREE.Line(geometry, mat);
    const totalVerts = (geometry.attributes['position'].count || 0);
    line.geometry.setDrawRange(0, 0);
    this.radialGroup.add(line);
    this.lines.push(line);
    // Guardar edge para paquetes de datos
    this.edges.push({ start: new THREE.Vector3(x1, y1, z1), end: new THREE.Vector3(x2, y2, z2) });
    // Fase según distancia al borde para animar desde los lados hacia el centro
    const distFromSide = Math.min(column, totalCols - column) / (totalCols * 0.5);
    const phase = (1 - distFromSide) * Math.PI; // bordes primero
    this.lineLifetimes.push({ life: Math.random() * 2, speed: 1.0 + Math.random() * 0.6, dir: 1, total: totalVerts, phase });
  }

  // Eliminado: puntos glow independientes (usamos nodes del grid)

  private generateZigZagPath(width: number, height: number, step: number): THREE.Vector3[] {
    // Inicia en borde izquierdo o derecho aleatoriamente
    const startLeft = Math.random() > 0.5;
    const startX = startLeft ? -width / 2 : width / 2;
    const startY = Math.floor((Math.random() * height) / step - height / (2 * step)) * step;

    const points: THREE.Vector3[] = [];
    let x = startX;
    let y = startY;
    const len = 8 + Math.floor(Math.random() * 18);

    // Dirección inicial horizontal hacia dentro
    let dirX = startLeft ? 1 : -1;
    let dirY = 0;

    for (let i = 0; i < len; i++) {
      // Mover un segmento
      const segLen = step * (1 + Math.floor(Math.random() * 3));
      x += dirX * segLen;
      y += dirY * segLen;
      points.push(new THREE.Vector3(x, y, 0));

      // Girar 90° aleatoriamente para formar esquinas tipo circuito
      if (Math.random() > 0.5) {
        const tmp = dirX;
        dirX = 0;
        dirY = (Math.random() > 0.5 ? 1 : -1) * Math.sign(tmp || 1);
      } else {
        dirY = 0;
        dirX = (Math.random() > 0.5 ? 1 : -1);
      }

      // Limitar dentro del área
      x = THREE.MathUtils.clamp(x, -width / 2, width / 2);
      y = THREE.MathUtils.clamp(y, -height / 2, height / 2);
    }

    // Asegurar mínimo 2 puntos
    if (points.length < 2) {
      points.push(new THREE.Vector3(x + step, y, 0));
    }
    return [new THREE.Vector3(startX, startY, 0), ...points];
  }

  private startAnimation(): void {
    this.ngZone.runOutsideAngular(() => {
      const animate = () => {
        this.frameId = requestAnimationFrame(animate);
        this.time += 0.016;

        // Animar desplazamiento de guiones para simular "dibujado"
        for (let i = 0; i < this.lines.length; i++) {
          const line = this.lines[i];
          const mat = line.material as THREE.LineDashedMaterial;
          const anyMat = mat as any;
          anyMat.dashOffset = (anyMat.dashOffset ?? 0) - 0.01;
          const meta = this.lineLifetimes[i];
          meta.life += 0.016 * meta.speed;
          // Crear desde los lados hacia el centro aprovechando phase
          const t = (Math.sin(meta.life + meta.phase) + 1) / 2; // 0..1
          const count = Math.max(2, Math.floor(2 + t * (meta.total - 2)));
          const start = 0;
          line.geometry.setDrawRange(start, count);
          mat.opacity = 0.5 + 0.4 * t;
          mat.needsUpdate = true;
        }

        // Mover paquetes de datos a lo largo de las aristas
        if (this.dataPackets.length < Math.min(60, Math.floor(this.edges.length * 0.3))) {
          // crear paquetes aleatorios
          const e = this.edges[Math.floor(Math.random() * this.edges.length)];
          if (e) {
            const geom = new THREE.SphereGeometry(1.2, 8, 8);
            const mat = new THREE.MeshBasicMaterial({ color: this.themeService.current() === 'dark' ? 0x93c5fd : 0x2563eb });
            const mesh = new THREE.Mesh(geom, mat);
            mesh.position.copy(e.start.clone());
            this.radialGroup.add(mesh);
            this.dataPackets.push({ mesh, start: e.start.clone(), end: e.end.clone(), speed: 0.4 + Math.random() * 0.8, phase: Math.random() * Math.PI * 2 });
          }
        }
        // actualizar posición de paquetes
        for (let i = this.dataPackets.length - 1; i >= 0; i--) {
          const p = this.dataPackets[i];
          const tt = (Math.sin(this.time * p.speed + p.phase) + 1) / 2; // ida y vuelta
          const pos = new THREE.Vector3().lerpVectors(p.start, p.end, tt);
          p.mesh.position.copy(pos);
          // variar brillo
          const mb = p.mesh.material as THREE.MeshBasicMaterial;
          mb.opacity = 0.6 + 0.4 * Math.sin(this.time * 2 + p.phase);
          mb.transparent = true;
          if (Math.random() < 0.002) {
            // reciclar: cambiar edge
            const e = this.edges[Math.floor(Math.random() * this.edges.length)];
            if (e) {
              p.start.copy(e.start);
              p.end.copy(e.end);
            }
          }
        }

        // Pulso general de los nodos
        if (this.nodePoints) {
          const pm = this.nodePoints.material as THREE.PointsMaterial;
          pm.size = 2.2 + 0.7 * (0.5 + 0.5 * Math.sin(this.time * 1.5));
          pm.needsUpdate = true;
        }

        // No regeneramos completamente; mantenemos patrón simétrico

        // Movimiento lento del grupo para sensación de vida
        this.radialGroup.rotation.z = Math.sin(this.time * 0.06) * 0.02;
        this.radialGroup.position.y = Math.sin(this.time * 0.18) * 4;

        this.renderer.render(this.scene, this.camera);
      };
      animate();
    });
  }

  @HostListener('window:resize')
  onResize(): void {
    if (!this.renderer) return;
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }
}


