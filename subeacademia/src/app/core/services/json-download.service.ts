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
    const exampleCertification: Omit<Certificacion, 'id'> = {
      // Campos del wizard simplificado
      title: "Certificación en Madurez Organizacional en IA (Practitioner)",
      slug: "certificacion-madurez-organizacional-ia-practitioner",
      shortDescription: "Valida el nivel de madurez de la empresa según el ARES‑AI Framework.",
      longDescription: "Esta certificación está diseñada para directivos y líderes de transformación que buscan validar y optimizar la madurez de su organización en la implementación de la IA, cubriendo desde la preparación hasta el escalado.",
      state: "Disponible",
      active: true,
      versionPlan: "2025.1",
      audience: "Empresas",
      category: "Madurez Organizacional",
      routeTypes: ["Formación"],
      durationHours: 0,
      modalities: {
        asincronica: true,
        enVivo: false,
        hibrida: false,
        presencial: false
      },
      languages: ["es"],
      currencies: {
        CLP: 850000,
        USD: 1000,
        EUR: 900
      },
      pricingNotes: "",
      paymentLink: "https://buy.stripe.com/example_link_formation",
      endorsers: ["SUBE-IA"],
      doubleSeal: false,
      validityMonths: 24,
      recertification: {
        required: false,
        type: "curso",
        hoursCEU: 0
      },
      evaluation: {
        exam: true,
        project: false,
        interview: false,
        defense: false,
        weights: {
          exam: 100
        }
      },
      validationTrack: {
        enabled: false,
        portfolioRequired: true,
        allowedFormats: ["pdf", "url"],
        autoInterviewBooking: true,
        SLA_days: 7
      },
      competencies: [],
      regulatoryAlignment: [],
      prerequisites: [],
      pathways: {
        predecessors: [],
        successors: []
      },
      heroImageUrl: "",
      sealImageUrl: "",
      gallery: [],
      seo: {
        metaTitle: "Certificación Madurez Organizacional IA | SUBE IA Tech",
        metaDescription: "Certifica la madurez de tu organización en IA con el ARES‑AI Framework."
      },
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy: "admin",
      updatedBy: "admin"
    };

    this.downloadJson(exampleCertification, `certificacion-ejemplo-wizard-${new Date().toISOString().split('T')[0]}.json`);
  }
}