import { Injectable, inject } from '@angular/core';
import { Functions, httpsCallable, HttpsCallableResult } from '@angular/fire/functions';
import { from, Observable, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class GenerativeAiService {
  private functions: Functions = inject(Functions);

  constructor() {}

  /**
   * Llama a la Cloud Function para generar objetivos basados en el contexto.
   * @param contextData Objeto con { industria, area, rol }
   */
  generateObjectives(contextData: any): Observable<string[]> {
    const generateObjectivesFn = httpsCallable(this.functions, 'generateObjectives');
    return from(generateObjectivesFn({ contextData })).pipe(
      map((result: HttpsCallableResult) => (result.data as any).objectives),
      catchError(error => {
        console.error('Error detallado desde la Cloud Function [generateObjectives]:', error);
        return throwError(() => new Error('Error al generar objetivos. Detalles en la consola.'));
      })
    );
  }

  /**
   * Llama a la Cloud Function para generar el reporte final del diagnóstico.
   * @param diagnosticData Objeto con todos los datos del diagnóstico.
   */
  generateReport(diagnosticData: any): Observable<{ reportText: string }> {
    const generateReportFn = httpsCallable(this.functions, 'generateDiagnosticReport');
    return from(generateReportFn({ diagnosticData })).pipe(
      map((result: HttpsCallableResult) => result.data as { reportText: string }),
      catchError(error => {
        console.error('Error detallado desde la Cloud Function [generateDiagnosticReport]:', error);
        return throwError(() => new Error('Error al generar el reporte. Detalles en la consola.'));
      })
    );
  }
}
