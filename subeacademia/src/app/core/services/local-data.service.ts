import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';

/**
 * Servicio de datos local que reemplaza FirebaseDataService
 * Usa almacenamiento local del navegador para simular base de datos
 */
@Injectable({
  providedIn: 'root'
})
export class LocalDataService {

  constructor() {
    console.info('📊 [LocalData] Servicio de datos local inicializado');
  }

  /**
   * Obtiene posts del blog (datos simulados)
   */
  getPosts(): Observable<any[]> {
    console.info('📝 [LocalData] Obteniendo posts del blog (simulado)');
    
    const mockPosts = [
      {
        id: '1',
        title: 'Bienvenido a SUBE AcademIA',
        content: 'Descubre el futuro de la educación en IA...',
        publishedAt: new Date().toISOString(),
        author: 'Equipo SUBE',
        slug: 'bienvenido-sube-academia'
      },
      {
        id: '2', 
        title: 'Fundamentos de IA para Empresas',
        content: 'Aprende los conceptos básicos de IA aplicada...',
        publishedAt: new Date(Date.now() - 86400000).toISOString(),
        author: 'Equipo SUBE',
        slug: 'fundamentos-ia-empresas'
      }
    ];

    return of(mockPosts);
  }

  /**
   * Obtiene cursos disponibles (datos simulados)
   */
  getCourses(): Observable<any[]> {
    console.info('🎓 [LocalData] Obteniendo cursos (simulados)');
    
    const mockCourses = [
      {
        id: '1',
        title: 'Fundamentos de IA',
        description: 'Curso introductorio a la Inteligencia Artificial',
        duration: '4 semanas',
        level: 'Principiante',
        price: 99,
        imageUrl: 'https://via.placeholder.com/300x200/4F46E5/FFFFFF?text=IA+Fundamentos'
      },
      {
        id: '2',
        title: 'Ética en IA',
        description: 'Aprende sobre los aspectos éticos de la IA',
        duration: '3 semanas', 
        level: 'Intermedio',
        price: 149,
        imageUrl: 'https://via.placeholder.com/300x200/10B981/FFFFFF?text=Ética+IA'
      }
    ];

    return of(mockCourses);
  }

  /**
   * Obtiene productos/servicios (datos simulados)
   */
  getProducts(): Observable<any[]> {
    console.info('🛍️ [LocalData] Obteniendo productos (simulados)');
    
    const mockProducts = [
      {
        id: '1',
        name: 'Consultoría en IA',
        description: 'Servicio de consultoría especializada en implementación de IA',
        price: 500,
        category: 'Consultoría',
        imageUrl: 'https://via.placeholder.com/300x200/8B5CF6/FFFFFF?text=Consultoría'
      },
      {
        id: '2',
        name: 'Auditoría de IA',
        description: 'Evaluación completa de la madurez en IA de tu organización',
        price: 300,
        category: 'Auditoría',
        imageUrl: 'https://via.placeholder.com/300x200/F59E0B/FFFFFF?text=Auditoría'
      }
    ];

    return of(mockProducts);
  }

  /**
   * Obtiene proyectos (datos simulados)
   */
  getProjects(): Observable<any[]> {
    console.info('🚀 [LocalData] Obteniendo proyectos (simulados)');
    
    const mockProjects = [
      {
        id: '1',
        title: 'Implementación de Chatbot',
        description: 'Desarrollo de chatbot inteligente para atención al cliente',
        status: 'Completado',
        client: 'Empresa ABC',
        imageUrl: 'https://via.placeholder.com/300x200/EF4444/FFFFFF?text=Chatbot'
      },
      {
        id: '2',
        title: 'Sistema de Recomendaciones',
        description: 'IA para recomendaciones personalizadas de productos',
        status: 'En Progreso',
        client: 'Empresa XYZ',
        imageUrl: 'https://via.placeholder.com/300x200/06B6D4/FFFFFF?text=Recomendaciones'
      }
    ];

    return of(mockProjects);
  }

  /**
   * Guarda un diagnóstico (simulado)
   */
  saveDiagnostic(diagnosticData: any): Observable<any> {
    console.info('💾 [LocalData] Guardando diagnóstico (simulado):', diagnosticData);
    
    // En un sistema real, aquí guardarías en una base de datos
    // Para simplicidad, solo simulamos el guardado
    const savedDiagnostic = {
      id: 'diagnostic_' + Date.now(),
      ...diagnosticData,
      savedAt: new Date().toISOString()
    };

    // Guardar en localStorage para persistencia local
    try {
      const existing = JSON.parse(localStorage.getItem('diagnostics') || '[]');
      existing.push(savedDiagnostic);
      localStorage.setItem('diagnostics', JSON.stringify(existing));
    } catch (error) {
      console.warn('⚠️ [LocalData] Error guardando diagnóstico:', error);
    }

    return of(savedDiagnostic);
  }

  /**
   * Obtiene diagnósticos guardados
   */
  getDiagnostics(): Observable<any[]> {
    console.info('📋 [LocalData] Obteniendo diagnósticos guardados');
    
    try {
      const diagnostics = JSON.parse(localStorage.getItem('diagnostics') || '[]');
      return of(diagnostics);
    } catch (error) {
      console.warn('⚠️ [LocalData] Error obteniendo diagnósticos:', error);
      return of([]);
    }
  }

  /**
   * Obtiene leads/diagnósticos (datos simulados)
   */
  getLeads(): Observable<any[]> {
    console.info('👥 [LocalData] Obteniendo leads (simulados)');
    
    const mockLeads = [
      {
        id: '1',
        name: 'Juan Pérez',
        email: 'juan@empresa.com',
        company: 'Empresa ABC',
        industry: 'Tecnología',
        completedAt: new Date().toISOString(),
        score: 75
      },
      {
        id: '2',
        name: 'María García',
        email: 'maria@empresa.com', 
        company: 'Empresa XYZ',
        industry: 'Finanzas',
        completedAt: new Date(Date.now() - 86400000).toISOString(),
        score: 82
      }
    ];

    return of(mockLeads);
  }

  /**
   * Obtiene media/archivos (datos simulados)
   */
  getMedia(): Observable<any[]> {
    console.info('📁 [LocalData] Obteniendo archivos de media (simulados)');
    
    // En modo local, no hay archivos persistentes
    return of([]);
  }

  /**
   * Obtiene configuración de la aplicación
   */
  getSettings(): Observable<any> {
    console.info('⚙️ [LocalData] Obteniendo configuración (simulada)');
    
    const mockSettings = {
      siteName: 'SUBE AcademIA',
      siteDescription: 'Plataforma de educación en Inteligencia Artificial',
      contactEmail: 'contacto@subeacademia.com',
      socialMedia: {
        twitter: '@subeacademia',
        linkedin: 'subeacademia'
      }
    };

    return of(mockSettings);
  }
}
