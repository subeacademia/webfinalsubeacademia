import { Component, ElementRef, Inject, NgZone, OnDestroy, OnInit, PLATFORM_ID, ViewChild, HostListener } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { ThemeService } from '../../../shared/theme.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-hero-scene',
  standalone: true,
  template: '<canvas #canvas class="w-full h-full block"></canvas>',
})
export class HeroSceneComponent implements OnInit, OnDestroy {
  @ViewChild('canvas', { static: true }) private canvasRef!: ElementRef<HTMLCanvasElement>;

  private scene!: THREE.Scene;
  private camera!: THREE.PerspectiveCamera;
  private renderer!: THREE.WebGLRenderer;
  private controls!: OrbitControls;
  
  // Elementos de la escena
  private neuronLayers: THREE.Group[] = [];
  private connections!: THREE.LineSegments;
  private particles: THREE.Points[] = [];
  private energyWaves: THREE.Mesh[] = [];
  private floatingOrbs: THREE.Mesh[] = [];
  private dataStreams: THREE.LineSegments[] = [];
  
  // Controles de animación
  private frameId: number | null = null;
  private time: number = 0;
  private mousePosition = { x: 0, y: 0 };
  
  // Suscripciones
  private themeSubscription!: Subscription;

  // Colores por tema
  private darkThemeColors = {
    bg: 0x0a0a1a,
    neuron: 0x818cf8,
    connection: 0x4f46e5,
    particle: 0x60a5fa,
    energy: 0x8b5cf6,
    orb: 0x06b6d4
  };
  
  private lightThemeColors = {
    bg: 0xffffff,
    neuron: 0x94a3b8,     // Gris azulado suave - no compite con el texto naranja
    connection: 0xb8b8b8, // Gris claro para conexiones sutiles
    particle: 0xd1d5db,   // Gris muy claro para partículas
    energy: 0xc7d2fe,     // Azul muy suave para ondas de energía
    orb: 0x6ee7b7         // Verde menta suave
  };

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
    
    // Cámara mejorada
    this.camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 1, 2000);
    this.camera.position.set(0, 0, 150);

    // Renderer con efectos avanzados
    this.renderer = new THREE.WebGLRenderer({ 
      canvas, 
      antialias: true,
      alpha: true,
      powerPreference: "high-performance"
    });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.2;

    // Controles mejorados
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.enableZoom = true;
    this.controls.autoRotate = true;
    this.controls.autoRotateSpeed = 0.1;
    this.controls.maxDistance = 400;
    this.controls.minDistance = 80;
    this.controls.dampingFactor = 0.05;

    // Crear elementos de la escena
    this.createNeuralNetwork();
    this.createParticleSystem();
    this.createEnergyWaves();
    this.createFloatingOrbs();
    this.createDataStreams();
    
    this.updateTheme(this.themeService.current() === 'dark');
  }

  private animate = (): void => {
    this.frameId = requestAnimationFrame(this.animate);
    this.time += 0.016; // 60fps aproximado

    // Animar red neuronal
    this.animateNeuralNetwork();
    
    // Animar partículas
    this.animateParticles();
    
    // Animar ondas de energía
    this.animateEnergyWaves();
    
    // Animar orbes flotantes
    this.animateFloatingOrbs();
    
    // Animar flujos de datos
    this.animateDataStreams();
    
    // Interacción con el mouse
    this.handleMouseInteraction();

    this.controls.update();
    this.renderer.render(this.scene, this.camera);
  }

  private createNeuralNetwork(): void {
    const layerSizes = [12, 18, 15, 10, 8]; // 5 capas más complejas
    const layerSpacing = 35;

    // Crear capas de neuronas con geometría mejorada
    layerSizes.forEach((size, i) => {
      const layer = new THREE.Group();
      const radius = size * 2.8;
      
      for (let j = 0; j < size; j++) {
        const angle = (j / size) * Math.PI * 2;
        const x = radius * Math.cos(angle);
        const y = radius * Math.sin(angle);
        
        // Geometría de neurona más detallada
        const neuronGeometry = new THREE.SphereGeometry(1.2, 32, 32);
        const neuronMaterial = new THREE.MeshPhongMaterial({ 
          color: 0xffffff,
          shininess: 100,
          emissive: 0x333333
        });
        
        const neuron = new THREE.Mesh(neuronGeometry, neuronMaterial);
        neuron.position.set(x, y, 0);
        neuron.castShadow = true;
        neuron.receiveShadow = true;
        
        // Añadir halo de luz
        const haloGeometry = new THREE.SphereGeometry(2, 16, 16);
        const haloMaterial = new THREE.MeshBasicMaterial({
          color: 0xffffff,
          transparent: true,
          opacity: 0.1
        });
        const halo = new THREE.Mesh(haloGeometry, haloMaterial);
        neuron.add(halo);
        
        layer.add(neuron);
      }
      
      layer.position.z = (i - (layerSizes.length - 1) / 2) * layerSpacing;
      this.neuronLayers.push(layer);
      this.scene.add(layer);
    });

    // Crear conexiones con efecto de pulso
    this.createConnections();
    
    // Añadir iluminación
    this.addLighting();
  }

  private createConnections(): void {
    const connectionPoints: THREE.Vector3[] = [];
    const connectionColors: number[] = [];
    
    for (let i = 0; i < this.neuronLayers.length - 1; i++) {
      const currentLayer = this.neuronLayers[i];
      const nextLayer = this.neuronLayers[i + 1];
      
      currentLayer.children.forEach((currentNeuron, j) => {
        nextLayer.children.forEach((nextNeuron, k) => {
          // Conexiones selectivas para evitar sobrecarga visual
          if (Math.random() > 0.3) {
            const start = currentLayer.localToWorld((currentNeuron as THREE.Mesh).position.clone());
            const end = nextLayer.localToWorld((nextNeuron as THREE.Mesh).position.clone());
            connectionPoints.push(start, end);
            
            // Colores alternados para las conexiones
            const color = j % 2 === 0 ? 0x818cf8 : 0x8b5cf6;
            connectionColors.push(color, color);
          }
        });
      });
    }
    
    const connectionGeometry = new THREE.BufferGeometry().setFromPoints(connectionPoints);
    connectionGeometry.setAttribute('color', new THREE.Float32BufferAttribute(connectionColors, 3));
    
    const connectionMaterial = new THREE.LineBasicMaterial({
      vertexColors: true,
      transparent: true,
      opacity: 0.3
    });
    
    this.connections = new THREE.LineSegments(connectionGeometry, connectionMaterial);
    this.scene.add(this.connections);
  }

  private createParticleSystem(): void {
    // Sistema de partículas flotantes
    const particleCount = 200;
    const particleGeometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);
    
    for (let i = 0; i < particleCount; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 400;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 400;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 400;
      
      colors[i * 3] = Math.random() * 0.5 + 0.5;
      colors[i * 3 + 1] = Math.random() * 0.5 + 0.5;
      colors[i * 3 + 2] = 1;
    }
    
    particleGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    particleGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    
    const particleMaterial = new THREE.PointsMaterial({
      size: 2,
      vertexColors: true,
      transparent: true,
      opacity: 0.8,
      blending: THREE.AdditiveBlending
    });
    
    const particleSystem = new THREE.Points(particleGeometry, particleMaterial);
    this.particles.push(particleSystem);
    this.scene.add(particleSystem);
  }

  private createEnergyWaves(): void {
    // Ondas de energía circulares
    for (let i = 0; i < 3; i++) {
      const waveGeometry = new THREE.RingGeometry(20 + i * 30, 22 + i * 30, 64);
      const waveMaterial = new THREE.MeshBasicMaterial({
        color: 0x8b5cf6,
        transparent: true,
        opacity: 0.1,
        side: THREE.DoubleSide
      });
      
      const wave = new THREE.Mesh(waveGeometry, waveMaterial);
      wave.rotation.x = Math.PI / 2;
      wave.position.z = -50 + i * 20;
      this.energyWaves.push(wave);
      this.scene.add(wave);
    }
  }

  private createFloatingOrbs(): void {
    // Orbes flotantes con efectos de luz
    for (let i = 0; i < 5; i++) {
      const orbGeometry = new THREE.SphereGeometry(3, 32, 32);
      const orbMaterial = new THREE.MeshPhongMaterial({
        color: 0x06b6d4,
        transparent: true,
        opacity: 0.6,
        shininess: 100
      });
      
      const orb = new THREE.Mesh(orbGeometry, orbMaterial);
      orb.position.set(
        (Math.random() - 0.5) * 200,
        (Math.random() - 0.5) * 200,
        (Math.random() - 0.5) * 200
      );
      
      this.floatingOrbs.push(orb);
      this.scene.add(orb);
    }
  }

  private createDataStreams(): void {
    // Flujos de datos animados
    for (let i = 0; i < 8; i++) {
      const points: THREE.Vector3[] = [];
      const startPoint = new THREE.Vector3(
        (Math.random() - 0.5) * 300,
        (Math.random() - 0.5) * 300,
        (Math.random() - 0.5) * 300
      );
      
      for (let j = 0; j < 10; j++) {
        const point = startPoint.clone().add(new THREE.Vector3(
          Math.sin(j * 0.5) * 20,
          Math.cos(j * 0.5) * 20,
          j * 10
        ));
        points.push(point);
      }
      
      const streamGeometry = new THREE.BufferGeometry().setFromPoints(points);
      const streamMaterial = new THREE.LineBasicMaterial({
        color: 0x60a5fa,
        transparent: true,
        opacity: 0.4
      });
      
      const stream = new THREE.LineSegments(streamGeometry, streamMaterial);
      this.dataStreams.push(stream);
      this.scene.add(stream);
    }
  }

  private addLighting(): void {
    // Luz ambiental
    const ambientLight = new THREE.AmbientLight(0x404040, 0.4);
    this.scene.add(ambientLight);
    
    // Luz direccional principal
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(50, 50, 50);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 2048;
    directionalLight.shadow.mapSize.height = 2048;
    this.scene.add(directionalLight);
    
    // Luz puntual para efectos
    const pointLight = new THREE.PointLight(0x8b5cf6, 1, 300);
    pointLight.position.set(0, 0, 100);
    this.scene.add(pointLight);
  }

  private animateNeuralNetwork(): void {
    this.neuronLayers.forEach((layer, i) => {
      // Rotación de capas
      layer.rotation.z = this.time * 0.05 * (i % 2 === 0 ? 1 : -1);
      layer.rotation.y = this.time * 0.03 * Math.sin(i * 0.5);
      
      // Animación de neuronas individuales
      layer.children.forEach((neuron, j) => {
        const scale = 1 + Math.sin(this.time * 2 + j * 0.5) * 0.3;
        neuron.scale.set(scale, scale, scale);
        
        // Rotación individual de neuronas
        (neuron as THREE.Mesh).rotation.y = this.time * 0.5 + j * 0.1;
      });
    });
  }

  private animateParticles(): void {
    this.particles.forEach(particleSystem => {
      const positions = particleSystem.geometry.attributes['position'].array as Float32Array;
      
      for (let i = 0; i < positions.length; i += 3) {
        positions[i + 1] += Math.sin(this.time + i * 0.01) * 0.1;
        positions[i + 2] += Math.cos(this.time + i * 0.01) * 0.1;
      }
      
      particleSystem.geometry.attributes['position'].needsUpdate = true;
      particleSystem.rotation.y = this.time * 0.1;
    });
  }

  private animateEnergyWaves(): void {
    this.energyWaves.forEach((wave, i) => {
      wave.scale.setScalar(1 + Math.sin(this.time + i) * 0.1);
      if (Array.isArray(wave.material)) {
        wave.material.forEach(mat => (mat as any).opacity = 0.1 + Math.sin(this.time * 2 + i) * 0.05);
      } else {
        (wave.material as any).opacity = 0.1 + Math.sin(this.time * 2 + i) * 0.05;
      }
      wave.rotation.z = this.time * 0.2 * (i + 1);
    });
  }

  private animateFloatingOrbs(): void {
    this.floatingOrbs.forEach((orb, i) => {
      orb.position.y += Math.sin(this.time + i) * 0.2;
      orb.position.x += Math.cos(this.time * 0.5 + i) * 0.1;
      orb.rotation.y = this.time * 0.3 + i;
      orb.rotation.z = this.time * 0.2 + i;
    });
  }

  private animateDataStreams(): void {
    this.dataStreams.forEach((stream, i) => {
      stream.rotation.y = this.time * 0.1 + i * 0.5;
      if (Array.isArray(stream.material)) {
        stream.material.forEach(mat => (mat as any).opacity = 0.4 + Math.sin(this.time + i) * 0.2);
      } else {
        (stream.material as any).opacity = 0.4 + Math.sin(this.time + i) * 0.2;
      }
    });
  }

  private handleMouseInteraction(): void {
    // Interacción sutil con el mouse
    const mouseX = (this.mousePosition.x / window.innerWidth) * 2 - 1;
    const mouseY = -(this.mousePosition.y / window.innerHeight) * 2 + 1;
    
    this.camera.position.x += (mouseX * 20 - this.camera.position.x) * 0.01;
    this.camera.position.y += (mouseY * 20 - this.camera.position.y) * 0.01;
  }

  private updateTheme(isDark: boolean): void {
    const colors = isDark ? this.darkThemeColors : this.lightThemeColors;
    this.scene.background = new THREE.Color(colors.bg);

    // Actualizar colores de neuronas
    this.neuronLayers.forEach(layer => {
      layer.children.forEach(neuron => {
        if (neuron instanceof THREE.Mesh) {
          ((neuron as THREE.Mesh).material as THREE.MeshPhongMaterial).color.set(colors.neuron);
        }
      });
    });

    // Actualizar colores de conexiones
    if (this.connections) {
      (this.connections.material as THREE.LineBasicMaterial).color.set(colors.connection);
    }
    
    // Actualizar colores de partículas
    this.particles.forEach(particleSystem => {
      (particleSystem.material as THREE.PointsMaterial).color.set(colors.particle);
    });
    
    // Actualizar colores de ondas de energía
    this.energyWaves.forEach(wave => {
      (wave.material as THREE.MeshBasicMaterial).color.set(colors.energy);
    });
    
    // Actualizar colores de orbes
    this.floatingOrbs.forEach(orb => {
      (orb.material as THREE.MeshPhongMaterial).color.set(colors.orb);
    });
  }

  @HostListener('window:resize')
  onWindowResize(): void {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  }

  @HostListener('mousemove', ['$event'])
  onMouseMove(event: MouseEvent): void {
    this.mousePosition.x = event.clientX;
    this.mousePosition.y = event.clientY;
  }
}


