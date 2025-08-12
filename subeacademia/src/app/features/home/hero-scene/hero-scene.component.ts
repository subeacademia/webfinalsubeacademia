import { Component, ElementRef, Inject, NgZone, OnDestroy, OnInit, PLATFORM_ID, ViewChild, HostListener } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { ThemeService } from '../../../shared/theme.service';
import { Subscription } from 'rxjs';

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
  private neuronLayers: THREE.Group[] = [];
  private connections!: THREE.LineSegments;
  private frameId: number | null = null;
  private themeSubscription!: Subscription;

  private darkThemeColors = { bg: 0x0a0a1a, neuron: 0x818cf8, connection: 0x4f46e5 };
  private lightThemeColors = { bg: 0xe0e7ff, neuron: 0x4f46e5, connection: 0x6366f1 };

  constructor(
    private ngZone: NgZone,
    @Inject(PLATFORM_ID) private platformId: object,
    private themeService: ThemeService
  ) {}

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.ngZone.runOutsideAngular(() => {
        this.initScene();
        this.animate();
      });
      this.themeSubscription = this.themeService.isDarkTheme$.subscribe(isDark => {
        this.updateTheme(isDark);
      });
    }
  }

  ngOnDestroy(): void {
    if (this.frameId != null) cancelAnimationFrame(this.frameId);
    this.controls?.dispose();
    this.themeSubscription?.unsubscribe();
  }

  private initScene(): void {
    const canvas = this.canvasRef.nativeElement;
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 1, 1000);
    this.camera.position.z = 100;

    // Renderer
    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    // Controles (para mouse y touch)
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.enableZoom = true;
    this.controls.autoRotate = true;
    this.controls.autoRotateSpeed = 0.2;
    this.controls.maxDistance = 300;
    this.controls.minDistance = 50;
    this.createNeuralNetwork();
    this.updateTheme(this.themeService.current() === 'dark');
  }

  private animate = (): void => {
    this.frameId = requestAnimationFrame(this.animate);
    const time = Date.now() * 0.002;

    // Animar neuronas
    this.neuronLayers.forEach((layer, i) => {
      layer.rotation.z = time * 0.1 * (i % 2 === 0 ? 1 : -1);
      layer.children.forEach((neuron, j) => {
        const scale = 1 + Math.sin(time * 0.5 + j) * 0.2;
        neuron.scale.set(scale, scale, scale);
      });
    });

    this.controls.update();
    this.renderer.render(this.scene, this.camera);
  }

  private createNeuralNetwork(): void {
    const layerSizes = [10, 16, 12, 8]; // 4 capas de neuronas
    const layerSpacing = 30;

    // Crear capas de neuronas
    layerSizes.forEach((size, i) => {
      const layer = new THREE.Group();
      const radius = size * 2.5;
      for (let j = 0; j < size; j++) {
        const angle = (j / size) * Math.PI * 2;
        const x = radius * Math.cos(angle);
        const y = radius * Math.sin(angle);
        const neuronGeometry = new THREE.SphereGeometry(1, 16, 16);
        const neuronMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff });
        const neuron = new THREE.Mesh(neuronGeometry, neuronMaterial);
        neuron.position.set(x, y, 0);
        layer.add(neuron);
      }
      layer.position.z = (i - (layerSizes.length - 1) / 2) * layerSpacing;
      this.neuronLayers.push(layer);
      this.scene.add(layer);
    });

    // Crear conexiones
    const connectionPoints: THREE.Vector3[] = [];
    for (let i = 0; i < this.neuronLayers.length - 1; i++) {
      const currentLayer = this.neuronLayers[i];
      const nextLayer = this.neuronLayers[i+1];
      currentLayer.children.forEach(currentNeuron => {
        nextLayer.children.forEach(nextNeuron => {
          const start = currentLayer.localToWorld((currentNeuron as THREE.Mesh).position.clone());
          const end = nextLayer.localToWorld((nextNeuron as THREE.Mesh).position.clone());
          connectionPoints.push(start, end);
        });
      });
    }
    const connectionGeometry = new THREE.BufferGeometry().setFromPoints(connectionPoints);
    const connectionMaterial = new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.15 });
    this.connections = new THREE.LineSegments(connectionGeometry, connectionMaterial);
    this.scene.add(this.connections);
  }

  private updateTheme(isDark: boolean): void {
    const colors = isDark ? this.darkThemeColors : this.lightThemeColors;
    this.scene.background = new THREE.Color(colors.bg);

    this.neuronLayers.forEach(layer => {
      layer.children.forEach(neuron => {
        ((neuron as THREE.Mesh).material as THREE.MeshBasicMaterial).color.set(colors.neuron);
      });
    });

    (this.connections.material as THREE.LineBasicMaterial).color.set(colors.connection);
  }

  @HostListener('window:resize')
  onWindowResize(): void {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  }
}


