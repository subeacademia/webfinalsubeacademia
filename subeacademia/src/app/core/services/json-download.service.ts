import { Injectable } from '@angular/core';
import { Certificacion } from '../../features/productos/data/certificacion.model';

@Injectable({
  providedIn: 'root'
})
export class JsonDownloadService {

  constructor() { }

  private downloadJson(data: any, filename: string): void {
    const dataStr = JSON.stringify(data, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);

    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();

    URL.revokeObjectURL(url);
  }

  downloadExampleJson(): void {
    // Estructura que espera la carga masiva
    const bulkData = {
      certificaciones: [
        {
          // Identidad y estado
          title: "Certificación en Madurez Organizacional en IA (Practitioner)",
          slug: "certificacion-madurez-organizacional-ia-practitioner",
          shortDescription: "Valida el nivel de madurez de la empresa según el ARES‑AI Framework.",
          longDescription: "Esta certificación está diseñada para directivos y líderes de transformación que buscan validar y optimizar la madurez de su organización en la implementación de la IA, cubriendo desde la preparación hasta el escalado.",
          state: "Disponible",
          active: true,
          versionPlan: "2025.1",
          
          // Clasificación
          audience: "Empresas",
          category: "Madurez Organizacional",
          routeTypes: ["Formación"],
          
          // Entrega
          durationHours: 0,
          modalities: {
            asincronica: true,
            enVivo: false,
            hibrida: false,
            presencial: false
          },
          languages: ["es"],
          
          // Economía
          currencies: {
            CLP: 850000,
            USD: 1000,
            EUR: 900
          },
          pricingNotes: "",
          paymentLink: "https://buy.stripe.com/example_link_formation",
          
          // Avales y sellos
          endorsers: ["SUBE-IA"],
          doubleSeal: false,
          
          // Vigencia y recertificación
          validityMonths: 24,
          recertification: {
            required: false,
            type: "curso",
            hoursCEU: 0
          },
          
          // Evaluación
          evaluation: {
            exam: true,
            project: false,
            interview: false,
            defense: false,
            weights: {
              exam: 100
            }
          },
          
          // Convalidación
          validationTrack: {
            enabled: false,
            portfolioRequired: true,
            allowedFormats: ["pdf", "url"],
            autoInterviewBooking: true,
            SLA_days: 7
          },
          
          // Competencias y alineación
          competencies: [],
          regulatoryAlignment: [],
          
          // Requisitos y rutas
          prerequisites: [],
          pathways: {
            predecessors: [],
            successors: []
          },
          
          // Medios y SEO
          heroImageUrl: "https://firebasestorage.googleapis.com/v0/b/sube-ia-tech.appspot.com/o/hero-images%2Fhero-madurez-ia.jpg?alt=media",
          sealImageUrl: "",
          gallery: [],
          seo: {
            metaTitle: "Certificación Madurez Organizacional IA | SUBE IA Tech",
            metaDescription: "Certifica la madurez de tu organización en IA con el ARES‑AI Framework."
          },
          
          // Auditoría
          createdAt: new Date(),
          updatedAt: new Date(),
          createdBy: "admin",
          updatedBy: "admin",
          
          // Campos legacy para compatibilidad
          titulo: "Certificación en Madurez Organizacional en IA (Practitioner)",
          descripcion: "Valida el nivel de madurez de la empresa según el ARES‑AI Framework. Esta certificación está diseñada para directivos y líderes de transformación que buscan validar y optimizar la madurez de su organización en la implementación de la IA, cubriendo desde la preparación hasta el escalado.",
          imagenDestacada: "https://firebasestorage.googleapis.com/v0/b/sube-ia-tech.appspot.com/o/hero-images%2Fhero-madurez-ia.jpg?alt=media",
          entidadCertificadora: "SUBE-IA",
          nivel: "Intermedio",
          precio: 850000,
          duracionHoras: 0,
          modalidad: "Asíncrona",
          estado: "Disponible",
          selloUrl: "",
          fechaCreacion: new Date(),
          fechaActualizacion: new Date(),
          activo: true
        },
        {
          // Identidad y estado
          title: "Certificación en Competencias de Personas y Equipos en IA (Foundations)",
          slug: "certificacion-competencias-personas-equipos-ia-foundations",
          shortDescription: "Valida las competencias individuales y de equipo en el uso efectivo de herramientas de IA.",
          longDescription: "Esta certificación está diseñada para trabajadores, profesionales y equipos que necesitan validar sus capacidades en el uso de herramientas de inteligencia artificial en el entorno laboral moderno.",
          state: "Disponible",
          active: true,
          versionPlan: "2025.1",
          
          // Clasificación
          audience: "Personas",
          category: "Competencias Personas/Equipos",
          routeTypes: ["Formación", "Convalidación"],
          
          // Entrega
          durationHours: 20,
          modalities: {
            asincronica: true,
            enVivo: true,
            hibrida: false,
            presencial: false
          },
          languages: ["es", "en"],
          
          // Economía
          currencies: {
            CLP: 450000,
            USD: 500,
            EUR: 450
          },
          pricingNotes: "Precios incluyen materiales y certificado digital",
          paymentLink: "https://buy.stripe.com/example_link_competencies",
          
          // Avales y sellos
          endorsers: ["SUBE-IA", "ARCHIADS"],
          doubleSeal: true,
          
          // Vigencia y recertificación
          validityMonths: 12,
          recertification: {
            required: true,
            type: "curso",
            hoursCEU: 5
          },
          
          // Evaluación
          evaluation: {
            exam: true,
            project: true,
            interview: false,
            defense: false,
            weights: {
              exam: 60,
              project: 40
            }
          },
          
          // Convalidación
          validationTrack: {
            enabled: true,
            portfolioRequired: true,
            allowedFormats: ["pdf", "url"],
            autoInterviewBooking: true,
            SLA_days: 5
          },
          
          // Competencias y alineación
          competencies: [
            "Uso de herramientas de IA",
            "Análisis de datos con IA",
            "Automatización de procesos",
            "Ética en IA"
          ],
          regulatoryAlignment: ["GDPR – protección de datos"],
          
          // Requisitos y rutas
          prerequisites: ["Conocimientos básicos de informática"],
          pathways: {
            predecessors: [],
            successors: ["Certificación Avanzada en IA"]
          },
          
          // Medios y SEO
          heroImageUrl: "https://firebasestorage.googleapis.com/v0/b/sube-ia-tech.appspot.com/o/hero-images%2Fhero-competencias-ia.jpg?alt=media",
          sealImageUrl: "",
          gallery: [],
          seo: {
            metaTitle: "Certificación Competencias IA | SUBE IA Tech",
            metaDescription: "Valida tus competencias en IA para el entorno laboral moderno."
          },
          
          // Auditoría
          createdAt: new Date(),
          updatedAt: new Date(),
          createdBy: "admin",
          updatedBy: "admin",
          
          // Campos legacy para compatibilidad
          titulo: "Certificación en Competencias de Personas y Equipos en IA (Foundations)",
          descripcion: "Certificación que valida las competencias individuales y de equipo en el uso efectivo de herramientas de IA en el entorno laboral.",
          imagenDestacada: "https://firebasestorage.googleapis.com/v0/b/sube-ia-tech.appspot.com/o/hero-images%2Fhero-competencias-ia.jpg?alt=media",
          entidadCertificadora: "SUBE-IA",
          nivel: "Básico",
          precio: 450000,
          duracionHoras: 20,
          modalidad: "Híbrida",
          estado: "Disponible",
          selloUrl: "",
          fechaCreacion: new Date(),
          fechaActualizacion: new Date(),
          activo: true
        }
      ]
    };

    this.downloadJson(bulkData, `certificaciones-bulk-${new Date().toISOString().split('T')[0]}.json`);
  }
}