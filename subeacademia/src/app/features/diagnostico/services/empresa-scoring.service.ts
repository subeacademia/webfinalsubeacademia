import { Injectable } from '@angular/core';
import {
  ReporteDiagnosticoEmpresa,
  RespuestaItem,
  RespuestaLikert,
  RespuestaMadurez,
  RespuestaVFNS,
  ResultadoDimension
} from '../data/empresa-diagnostic.models';
import { CUESTIONARIO_EMPRESAS } from '../data/empresa-questions';

@Injectable({
  providedIn: 'root'
})
export class EmpresaScoringService {

  constructor() { }

  private mapLikert(valor: RespuestaLikert): number {
    const map = { 1: 0, 2: 25, 3: 50, 4: 75, 5: 100 };
    return map[valor] || 0;
  }

  private mapVFNS(valor: RespuestaVFNS): number {
    return valor === 'V' ? 100 : 0;
  }

  private mapMadurez(valor: RespuestaMadurez): number {
    const map = { 'I': 0, 'B': 25, 'M': 50, 'A': 75, 'T': 100 };
    return map[valor] || 0;
  }

  private getNivelFromPuntaje(p: number): 'Incipiente' | 'Básico' | 'Intermedio' | 'Avanzado' | 'Transformador' {
    if (p <= 19) return 'Incipiente';
    if (p <= 39) return 'Básico';
    if (p <= 59) return 'Intermedio';
    if (p <= 79) return 'Avanzado';
    return 'Transformador';
  }

  private getNota1a7(p: number): number {
    return +(1 + 6 * (p / 100)).toFixed(1);
  }

  public calcularResultados(reporte: ReporteDiagnosticoEmpresa): ReporteDiagnosticoEmpresa {
    reporte.respuestas.forEach(item => {
      if (item.respuesta !== null) {
        switch (item.tipo) {
          case 'Likert':
            item.puntaje_0_100 = this.mapLikert(item.respuesta as RespuestaLikert);
            break;
          case 'VFNS':
            item.puntaje_0_100 = this.mapVFNS(item.respuesta as RespuestaVFNS);
            break;
          case 'Madurez':
            item.puntaje_0_100 = this.mapMadurez(item.respuesta as RespuestaMadurez);
            break;
        }
      } else {
        item.puntaje_0_100 = 0;
      }
    });

    const resultadosDimensiones: ResultadoDimension[] = [];
    CUESTIONARIO_EMPRESAS.forEach(dimension => {
      const itemsDeDimension = reporte.respuestas.filter(r => r.dimension === dimension.nombre);
      const sumaPuntajes = itemsDeDimension.reduce((acc, item) => acc + item.puntaje_0_100, 0);
      const promedio = itemsDeDimension.length > 0 ? sumaPuntajes / itemsDeDimension.length : 0;

      resultadosDimensiones.push({
        nombre: dimension.nombre,
        indice_0_100: +promedio.toFixed(1),
        nota_1_7: this.getNota1a7(promedio),
        nivel: this.getNivelFromPuntaje(promedio)
      });
    });
    reporte.puntajes.dimensiones = resultadosDimensiones;

    const sumaPromedios = resultadosDimensiones.reduce((acc, dim) => acc + dim.indice_0_100, 0);
    const promedioGlobal = resultadosDimensiones.length > 0 ? sumaPromedios / resultadosDimensiones.length : 0;
    reporte.puntajes.ig_ia_0a100 = +promedioGlobal.toFixed(1);
    reporte.puntajes.ig_ia_1a7 = this.getNota1a7(promedioGlobal);
    reporte.puntajes.ig_ia_nivel = this.getNivelFromPuntaje(promedioGlobal);

    return reporte;
  }

  public getCategoriaPorVentasUF(ventasUF: string | number): 'Micro' | 'Pequeña' | 'Mediana' | 'Grande' {
    // Si es un string (rango), mapear directamente
    if (typeof ventasUF === 'string') {
      switch (ventasUF) {
        case '0-2400': return 'Micro';
        case '2401-25000': return 'Pequeña';
        case '25001-100000': return 'Mediana';
        case '100001+': return 'Grande';
        default: return 'Micro';
      }
    }
    
    // Si es un número (compatibilidad hacia atrás)
    if (ventasUF <= 2400) return 'Micro';
    if (ventasUF <= 25000) return 'Pequeña';
    if (ventasUF <= 100000) return 'Mediana';
    return 'Grande';
  }
}
