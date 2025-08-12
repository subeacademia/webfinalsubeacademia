import { Component, ElementRef, Inject, NgZone, OnDestroy, OnInit, PLATFORM_ID, ViewChild } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

@Component({
  selector: 'app-hero-scene',
  standalone: true,
  // La plantilla ahora es un canvas que se ajustará al contenedor
  template: '<canvas #canvas class="w-full h-full block"></canvas>',
})
export class HeroSceneComponent implements OnInit, OnDestroy {
  @ViewChild('canvas', { static: true }) private canvasRef!: ElementRef<HTMLCanvasElement>;

  private scene!: THREE.Scene;
  private camera!: THREE.PerspectiveCamera;
  private renderer!: THREE.WebGLRenderer;
  private controls!: OrbitControls;
  private particles!: THREE.Points;
  private frameId: number | null = null;

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
    }
  }

  ngOnDestroy(): void {
    if (this.frameId != null) {
      cancelAnimationFrame(this.frameId);
    }
    if (isPlatformBrowser(this.platformId)) {
      window.removeEventListener('resize', this.onWindowResize);
    }
    this.controls?.dispose();
    // Liberar recursos Three.js
    this.renderer?.dispose();
    (this.particles?.geometry as THREE.BufferGeometry)?.dispose();
    (this.particles?.material as THREE.PointsMaterial)?.dispose();
  }

  private initScene(): void {
    const canvas = this.canvasRef.nativeElement;
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    this.camera.position.z = 200;

    // Renderer
    this.renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true, alpha: true });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    // Controles (para mouse y touch)
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.enableZoom = true; // Permite zoom
    this.controls.autoRotate = true; // Rotación automática sutil
    this.controls.autoRotateSpeed = 0.3;

    // Geometría de la Red Neuronal (más optimizada)
    const particleCount = 5000;
    const positions = new Float32Array(particleCount * 3);
    const geometry = new THREE.BufferGeometry();

    for (let i = 0; i < particleCount; i++) {
      const i3 = i * 3;
      positions[i3] = (Math.random() - 0.5) * 500;
      positions[i3 + 1] = (Math.random() - 0.5) * 500;
      positions[i3 + 2] = (Math.random() - 0.5) * 500;
    }
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    const material = new THREE.PointsMaterial({
      color: 0x818cf8, // Un tono índigo claro
      size: 0.5,
      blending: THREE.AdditiveBlending,
      transparent: true,
      sizeAttenuation: true,
    });

    this.particles = new THREE.Points(geometry, material);
    this.scene.add(this.particles);
  }

  private animate = (): void => {
    this.frameId = requestAnimationFrame(this.animate);

    // Actualiza los controles para el efecto de "damping" (suavizado)
    this.controls.update();

    this.renderer.render(this.scene, this.camera);
  }

  private onWindowResize = (): void => {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  }
}


