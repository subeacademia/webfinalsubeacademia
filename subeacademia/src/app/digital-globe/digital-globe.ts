import { Component, OnInit, AfterViewInit, OnDestroy, ElementRef, ViewChild } from '@angular/core';
import * as THREE from 'three';
import { ThemeService } from '../shared/theme.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-digital-globe',
  standalone: true,
  imports: [],
  templateUrl: './digital-globe.html',
  styleUrl: './digital-globe.css'
})
export class DigitalGlobe implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('globeCanvas', { static: false }) canvasRef!: ElementRef<HTMLCanvasElement>;

  private scene!: THREE.Scene;
  private camera!: THREE.PerspectiveCamera;
  private renderer!: THREE.WebGLRenderer;
  private globe!: THREE.Group;
  private particles!: THREE.Points;
  private animationId: number | undefined;
  private mouseX = 0;
  private mouseY = 0;
  private themeSub?: Subscription;

  // Guardar referencias enlazadas para poder remover listeners correctamente
  private readonly boundOnMouseMove = this.onMouseMove.bind(this);
  private readonly boundOnWindowResize = this.onWindowResize.bind(this);

  constructor(private readonly theme: ThemeService) {}

  ngOnInit(): void {
    window.addEventListener('mousemove', this.boundOnMouseMove);
    window.addEventListener('resize', this.boundOnWindowResize);
    // Reaccionar al tema para ajustar color de fondo y opacidades
    this.themeSub = this.theme.isDarkTheme$.subscribe(isDark => this.applyTheme(isDark));
  }

  ngAfterViewInit(): void {
    this.initThreeJS();
    this.createDigitalGlobe();
    this.createParticles();
    this.createConnections();
    this.animate();
  }

  ngOnDestroy(): void {
    window.removeEventListener('mousemove', this.boundOnMouseMove);
    window.removeEventListener('resize', this.boundOnWindowResize);
    this.themeSub?.unsubscribe();

    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
    }

    try {
      if (this.renderer) this.renderer.dispose();
      // Liberar recursos básicos
      const disposeObject = (obj: THREE.Object3D) => {
        obj.traverse((child: any) => {
          if (child.geometry) child.geometry.dispose?.();
          if (child.material) {
            if (Array.isArray(child.material)) child.material.forEach((m: any) => m.dispose?.());
            else child.material.dispose?.();
          }
        });
      };
      if (this.globe) disposeObject(this.globe);
      if (this.particles) disposeObject(this.particles);
    } catch {}
  }

  private initThreeJS(): void {
    const canvas = this.canvasRef.nativeElement;

    this.scene = new THREE.Scene();
    this.scene.fog = new THREE.FogExp2(0x000000, 0.0008);

    this.camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    this.camera.position.z = 30;

    this.renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      alpha: true
    });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(window.devicePixelRatio);
    // Color base se ajustará según el tema
    this.renderer.setClearColor(0x000000, 1);

    const ambientLight = new THREE.AmbientLight(0x404040, 0.5);
    this.scene.add(ambientLight);

    const pointLight = new THREE.PointLight(0x00ffff, 1);
    pointLight.position.set(50, 50, 50);
    this.scene.add(pointLight);

    // Aplicar tema actual inmediatamente
    this.applyTheme(this.theme.current() === 'dark');
  }

  private createDigitalGlobe(): void {
    this.globe = new THREE.Group();

    const geometry = new THREE.SphereGeometry(15, 50, 50);
    const material = new THREE.PointsMaterial({
      color: 0x00ffff,
      size: 0.1,
      transparent: true,
      opacity: 0.8,
      blending: THREE.AdditiveBlending
    });
    const points = new THREE.Points(geometry, material);
    this.globe.add(points);

    const wireframeGeometry = new THREE.IcosahedronGeometry(15, 1);
    const wireframeMaterial = new THREE.MeshBasicMaterial({
      color: 0x0080ff,
      wireframe: true,
      transparent: true,
      opacity: 0.3
    });
    const wireframeMesh = new THREE.Mesh(wireframeGeometry, wireframeMaterial);
    this.globe.add(wireframeMesh);

    for (let i = 0; i < 3; i++) {
      const ringGeometry = new THREE.TorusGeometry(18 + i * 3, 0.1, 8, 100);
      const ringMaterial = new THREE.MeshBasicMaterial({
        color: new THREE.Color().setHSL(0.5 + i * 0.1, 1, 0.5),
        transparent: true,
        opacity: 0.3
      });
      const ring = new THREE.Mesh(ringGeometry, ringMaterial);
      ring.rotation.x = Math.random() * Math.PI;
      ring.rotation.y = Math.random() * Math.PI;
      this.globe.add(ring);
    }

    this.scene.add(this.globe);
  }

  private createParticles(): void {
    const particlesGeometry = new THREE.BufferGeometry();
    const particlesCnt = 5000;
    const positions = new Float32Array(particlesCnt * 3);
    const colors = new Float32Array(particlesCnt * 3);

    for (let i = 0; i < particlesCnt * 3; i += 3) {
      const radius = Math.random() * 100 + 20;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos((Math.random() * 2) - 1);

      positions[i] = radius * Math.sin(phi) * Math.cos(theta);
      positions[i + 1] = radius * Math.sin(phi) * Math.sin(theta);
      positions[i + 2] = radius * Math.cos(phi);

      colors[i] = 0;
      colors[i + 1] = Math.random() * 0.5 + 0.5;
      colors[i + 2] = Math.random() * 0.5 + 0.5;
    }

    particlesGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    particlesGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const particlesMaterial = new THREE.PointsMaterial({
      size: 0.5,
      vertexColors: true,
      transparent: true,
      opacity: 0.6,
      blending: THREE.AdditiveBlending
    });

    this.particles = new THREE.Points(particlesGeometry, particlesMaterial);
    this.scene.add(this.particles);
  }

  private createConnections(): void {
    const connectionsGeometry = new THREE.BufferGeometry();
    const connectionsCnt = 100;
    const positions = new Float32Array(connectionsCnt * 6);

    for (let i = 0; i < connectionsCnt * 6; i += 6) {
      const radius = 15 + Math.random() * 5;

      const theta1 = Math.random() * Math.PI * 2;
      const phi1 = Math.acos((Math.random() * 2) - 1);

      const theta2 = theta1 + (Math.random() - 0.5) * 0.5;
      const phi2 = phi1 + (Math.random() - 0.5) * 0.5;

      positions[i] = radius * Math.sin(phi1) * Math.cos(theta1);
      positions[i + 1] = radius * Math.sin(phi1) * Math.sin(theta1);
      positions[i + 2] = radius * Math.cos(phi1);

      positions[i + 3] = radius * Math.sin(phi2) * Math.cos(theta2);
      positions[i + 4] = radius * Math.sin(phi2) * Math.sin(theta2);
      positions[i + 5] = radius * Math.cos(phi2);
    }

    connectionsGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    const connectionsMaterial = new THREE.LineBasicMaterial({
      color: 0x00ff00,
      transparent: true,
      opacity: 0.2,
      blending: THREE.AdditiveBlending
    });

    const connections = new THREE.LineSegments(connectionsGeometry, connectionsMaterial);
    this.globe.add(connections);
  }

  private animate(): void {
    this.animationId = requestAnimationFrame(() => this.animate());

    if (this.globe) {
      this.globe.rotation.y += 0.002;
      this.globe.rotation.x += 0.0005;

      this.globe.children.forEach((child, index) => {
        if ((child as any).geometry instanceof THREE.TorusGeometry) {
          child.rotation.x += 0.001 * (index + 1);
          child.rotation.y += 0.002 * (index + 1);
        }
      });
    }

    if (this.particles) {
      this.particles.rotation.y += 0.0002;
      this.particles.rotation.x += 0.0001;
    }

    this.camera.position.x += (this.mouseX * 0.05 - this.camera.position.x) * 0.05;
    this.camera.position.y += (-this.mouseY * 0.05 - this.camera.position.y) * 0.05;
    this.camera.lookAt(this.scene.position);

    this.renderer.render(this.scene, this.camera);
  }

  private onMouseMove(event: MouseEvent): void {
    this.mouseX = (event.clientX - window.innerWidth / 2) / 100;
    this.mouseY = (event.clientY - window.innerHeight / 2) / 100;
  }

  private onWindowResize(): void {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }

  private applyTheme(isDark: boolean): void {
    if (!this.renderer || !this.scene) return;
    const bgColor = isDark ? 0x000000 : 0xffffff;
    const fogDensity = 0.0008;
    this.renderer.setClearColor(bgColor, 1);
    this.scene.fog = new THREE.FogExp2(bgColor, fogDensity);

    // Ajustar opacidad/mezcla para que se vea bien en light/dark
    // Partículas de fondo
    if (this.particles) {
      const pm = this.particles.material as THREE.PointsMaterial;
      pm.opacity = isDark ? 0.6 : 0.45;
      pm.blending = isDark ? THREE.AdditiveBlending : THREE.NormalBlending;
      pm.needsUpdate = true;
    }

    // Elementos del globo
    if (this.globe) {
      this.globe.traverse(obj => {
        const anyObj = obj as any;
        if (anyObj.material) {
          const mat = anyObj.material as THREE.Material & { opacity?: number; transparent?: boolean; blending?: THREE.Blending };
          if (typeof mat.opacity === 'number') {
            mat.opacity = isDark ? Math.min(0.8, mat.opacity ?? 0.8) : Math.min(0.6, mat.opacity ?? 0.6);
          }
          if (mat.transparent !== undefined) mat.transparent = true;
          if (mat.blending !== undefined) mat.blending = isDark ? THREE.AdditiveBlending : THREE.NormalBlending;
          mat.needsUpdate = true as any;
        }
      });
    }
  }
}
