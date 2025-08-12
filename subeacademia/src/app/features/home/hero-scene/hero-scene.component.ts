import { Component, ElementRef, Inject, NgZone, OnDestroy, OnInit, PLATFORM_ID, ViewChild } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import * as THREE from 'three';

@Component({
  selector: 'app-hero-scene',
  standalone: true,
  template: '<div #canvasContainer class="w-full h-full"></div>',
})
export class HeroSceneComponent implements OnInit, OnDestroy {
  @ViewChild('canvasContainer', { static: true }) canvasContainer!: ElementRef;

  private scene!: THREE.Scene;
  private camera!: THREE.PerspectiveCamera;
  private renderer!: THREE.WebGLRenderer;
  private points!: THREE.Points;
  private lines!: THREE.LineSegments;
  private frameId: number | null = null;
  private mouse = new THREE.Vector2();
  private targetRotation = new THREE.Vector2();

  constructor(
    private ngZone: NgZone,
    @Inject(PLATFORM_ID) private platformId: object
  ) {}

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.ngZone.runOutsideAngular(() => {
        this.initScene();
        this.animate();
      });
      window.addEventListener('resize', this.onWindowResize);
      this.canvasContainer.nativeElement.addEventListener('mousemove', this.onMouseMove);
    }
  }

  ngOnDestroy(): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }
    if (this.frameId != null) {
      cancelAnimationFrame(this.frameId);
    }
    if (typeof window !== 'undefined') {
      window.removeEventListener('resize', this.onWindowResize);
    }
    if (this.canvasContainer?.nativeElement) {
      this.canvasContainer.nativeElement.removeEventListener('mousemove', this.onMouseMove);
    }
  }

  private initScene(): void {
    const container = this.canvasContainer.nativeElement;
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(75, container.clientWidth / container.clientHeight, 0.1, 1000);
    this.camera.position.z = 300;

    // --- Creación de la Red Neuronal ---
    const particleCount = 200;
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);
    const connections: number[] = [];

    const color = new THREE.Color();

    for (let i = 0; i < particleCount; i++) {
      // Posición aleatoria en una esfera
      const vertex = new THREE.Vector3(
        (Math.random() - 0.5) * 500,
        (Math.random() - 0.5) * 500,
        (Math.random() - 0.5) * 500
      );
      vertex.normalize().multiplyScalar(Math.random() * 150 + 50);
      positions[i * 3] = vertex.x;
      positions[i * 3 + 1] = vertex.y;
      positions[i * 3 + 2] = vertex.z;

      // Color basado en la posición
      color.setHSL(0.6 + vertex.y * 0.002, 0.7, 0.5);
      colors[i * 3] = color.r;
      colors[i * 3 + 1] = color.g;
      colors[i * 3 + 2] = color.b;
    }

    // Conexiones entre nodos cercanos
    for (let i = 0; i < particleCount; i++) {
      for (let j = i + 1; j < particleCount; j++) {
        const dx = positions[i * 3] - positions[j * 3];
        const dy = positions[i * 3 + 1] - positions[j * 3 + 1];
        const dz = positions[i * 3 + 2] - positions[j * 3 + 2];
        const distance = Math.sqrt(dx * dx + dy * dy + dz * dz);

        if (distance < 60) {
          connections.push(i, j);
        }
      }
    }

    // Nodos (Neuronas)
    const pointsGeometry = new THREE.BufferGeometry();
    pointsGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    pointsGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    const pointsMaterial = new THREE.PointsMaterial({ size: 3, vertexColors: true, blending: THREE.AdditiveBlending, transparent: true });
    this.points = new THREE.Points(pointsGeometry, pointsMaterial);
    this.scene.add(this.points);

    // Conexiones (Sinapsis)
    const linesGeometry = new THREE.BufferGeometry();
    linesGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    linesGeometry.setIndex(new THREE.BufferAttribute(new Uint16Array(connections), 1));
    const linesMaterial = new THREE.LineBasicMaterial({ color: 0x4f46e5, transparent: true, opacity: 0.1 });
    this.lines = new THREE.LineSegments(linesGeometry, linesMaterial);
    this.scene.add(this.lines);

    // Renderer
    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    this.renderer.setSize(container.clientWidth, container.clientHeight);
    this.renderer.setPixelRatio(window.devicePixelRatio);
    container.appendChild(this.renderer.domElement);
  }

  private animate = (): void => {
    this.frameId = requestAnimationFrame(this.animate);

    const time = Date.now() * 0.0001;
    const positions = (this.points.geometry as THREE.BufferGeometry).attributes['position'].array as Float32Array;

    // Animación sutil de los nodos
    for (let i = 0; i < positions.length; i += 3) {
      const x = positions[i];
      positions[i + 1] += Math.sin(time + x) * 0.1;
    }
    (this.points.geometry as THREE.BufferGeometry).attributes['position'].needsUpdate = true;

    // Suaviza la rotación de la cámara
    this.scene.rotation.y += (this.targetRotation.x - this.scene.rotation.y) * 0.05;
    this.scene.rotation.x += (this.targetRotation.y - this.scene.rotation.x) * 0.05;

    this.renderer.render(this.scene, this.camera);
  };

  private onWindowResize = (): void => {
    const container = this.canvasContainer.nativeElement;
    this.camera.aspect = container.clientWidth / container.clientHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(container.clientWidth, container.clientHeight);
  };

  private onMouseMove = (event: MouseEvent): void => {
    const rect = this.canvasContainer.nativeElement.getBoundingClientRect();
    this.mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    this.mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

    this.targetRotation.x = this.mouse.x * 0.5;
    this.targetRotation.y = this.mouse.y * 0.5;
  };
}


