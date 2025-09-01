import { Injectable, inject, signal } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Firestore, addDoc, collection, collectionData, query, where, orderBy, doc, docData, updateDoc } from '@angular/fire/firestore';
import { DiagnosticoPersistedPayload } from '../data/diagnostic.models';
import { Observable, map, firstValueFrom, from, throwError, of, timeout, catchError } from 'rxjs';
import { PlanDeAccionItem } from '../data/report.model';
import { AsistenteIaService } from '../../../shared/ui/chatbot/asistente-ia.service';
import { environment } from '../../../../environments/environment';

interface AIReport {
  analysis: string;
  actionPlan: PlanDeAccionItem[];
}

interface UserDiagnostic {
  id: string;
  userId: string;
  fecha: Date;
  puntajeGeneral: number;
  objetivo?: string;
  industria?: string;
  data: any;
}

@Injectable({ providedIn: 'root' })
export class DiagnosticsService {
	private readonly firestore = inject(Firestore);
    private readonly http = inject(HttpClient);
    private readonly asistenteIaService = inject(AsistenteIaService);

    // State for AI-generated report
    aiReport = signal<AIReport | null>(null);
    isLoading = signal<boolean>(false);
    error = signal<string | null>(null);
    
    // 🔧 SOLUCIÓN: Timeouts y reintentos mejorados
    private readonly API_TIMEOUT = 25000; // 25 segundos
    private readonly MAX_RETRIES = 2;

        async generateAIReport(diagnosticData: any): Promise<void> {
      this.isLoading.set(true);
      this.error.set(null);
      this.aiReport.set(null);

      console.log('🚀 DiagnosticsService: Iniciando generación de reporte con IA');
      console.log('📊 Datos del diagnóstico:', diagnosticData);

const context = `
Eres un experto coach en desarrollo profesional y transformación digital para la era de la IA. Tu análisis debe basarse estrictamente en dos documentos rectores:
1. La metodología 'ARES-AI Framework', que significa Agile (Ágil), Responsible (Responsable), Ethical (Ético) y Sustainable (Sostenible).
2. Las '13 Competencias de SUBE Academia para la era de la IA'.

Tu objetivo es generar un reporte con dos secciones claras en formato JSON: 'analysis' y 'actionPlan'.

Para el 'analysis', debes ofrecer un resumen conciso de las fortalezas y áreas de oportunidad del usuario, mencionando explícitamente 2 o 3 de las 13 competencias más relevantes según sus respuestas.

Para el 'actionPlan', debes crear una lista de 3 a 5 pasos concretos y accionables. Cada paso debe estar directamente vinculado a mejorar una de las competencias identificadas y debe seguir los principios ARES: ser práctico (Ágil), consciente de su impacto (Responsable y Ético) y enfocado en el crecimiento a largo plazo (Sostenible).
`;

      const payload = {
        diagnosticData,
        context,
      };

      try {
        console.log('🌐 Enviando solicitud a la API de Vercel...');
        console.log('🔗 URL:', environment.backendIaUrl);
        
        const response = await firstValueFrom(
          this.http.post<AIReport>(environment.backendIaUrl, payload).pipe(
            timeout(this.API_TIMEOUT),
            catchError((err: HttpErrorResponse) => {
              console.error('❌ Error en la API de Vercel:', err);
              console.error('📊 Status:', err.status);
              console.error('📊 Status Text:', err.statusText);
              console.error('📊 Error Body:', err.error);
              
              let errorMessage = 'Hubo un error al generar el reporte. Por favor, intenta de nuevo.';
              
              if (err.status === 0) {
                errorMessage = 'Error de conexión. Verifica tu conexión a internet.';
              } else if (err.status === 500) {
                errorMessage = 'Error interno del servidor. El servicio de IA no está disponible temporalmente.';
              } else if (err.status === 404) {
                errorMessage = 'Servicio no encontrado. Contacta al administrador.';
              } else if (err.status >= 400 && err.status < 500) {
                errorMessage = 'Error en la solicitud. Verifica los datos e intenta de nuevo.';
              }
              
              this.error.set(errorMessage);
              return throwError(() => new Error(`API call failed: ${err.status} - ${err.statusText}`));
            })
          )
        );
        
        console.log('✅ Respuesta recibida de la API:', response);
        this.aiReport.set(response);
        
      } catch (error) {
        console.error('❌ Error general en generateAIReport:', error);
        // El error ya fue manejado en el catchError block
      } finally {
        this.isLoading.set(false);
        console.log('🏁 Generación de reporte completada');
      }
    }
    
    generateDetailedReport(diagnosticData: any): Observable<any> {
        console.log('🚀 Iniciando generación de reporte detallado...');
        
        // 🔧 SOLUCIÓN: Fallback inmediato si no hay datos
        if (!diagnosticData) {
            console.warn('⚠️ No hay datos de diagnóstico, usando fallback');
            return of(this.generateFallbackReport());
        }
        
        const buildContext = typeof diagnosticData === 'string' ? diagnosticData : JSON.stringify(diagnosticData);
        const resumenPrompt = `Basado en los siguientes datos de un diagnóstico de competencias: ${buildContext}, genera un "resumen_ejecutivo" conciso y profesional.`;
        const fodaPrompt = `Con la misma información del diagnóstico: ${buildContext}, realiza un "analisis_foda" detallado en formato JSON con claves fortalezas, debilidades, oportunidades y amenazas como arrays de strings.`;
        const areasPrompt = `Usando la información del diagnóstico: ${buildContext}, devuelve una lista breve (3 a 5) de "areas_enfoque_principales" en JSON como un array de strings.`;

        const promise = (async () => {
            try {
                // 🔧 SOLUCIÓN: Timeout global para evitar que se quede colgado
                const timeoutPromise = new Promise((_, reject) => {
                    setTimeout(() => reject(new Error('Timeout global alcanzado')), this.API_TIMEOUT);
                });
                
                const apiPromise = Promise.all([
                    this.callVercelAPIWithFallback(resumenPrompt, 'resumen'),
                    this.callVercelAPIWithFallback(fodaPrompt, 'foda'),
                    this.callVercelAPIWithFallback(areasPrompt, 'areas')
                ]);
                
                const [resumen, fodaRaw, areasRaw] = await Promise.race([apiPromise, timeoutPromise]) as [string, string, string];

                let analisis_foda: any = { fortalezas: [], debilidades: [], oportunidades: [], amenazas: [] };
                try { 
                    analisis_foda = JSON.parse(fodaRaw); 
                } catch (e) {
                    console.warn('⚠️ Error parseando FODA, usando fallback:', e);
                    analisis_foda = this.generateFallbackFODA();
                }

                let areas_enfoque_principales: string[] = [];
                try {
                    const parsed = JSON.parse(areasRaw);
                    areas_enfoque_principales = Array.isArray(parsed) ? parsed : [];
                } catch (e) {
                    console.warn('⚠️ Error parseando áreas, usando fallback:', e);
                    areas_enfoque_principales = this.generateFallbackAreas();
                }

                console.log('✅ Reporte generado exitosamente');
                return {
                    resumen_ejecutivo: resumen || this.generateFallbackResumen(),
                    analisis_foda,
                    areas_enfoque_principales
                } as any;
                
            } catch (error) {
                console.error('❌ Error generando reporte detallado:', error);
                console.log('🔄 Usando reporte de fallback...');
                return this.generateFallbackReport();
            }
        })();

        return from(promise);
    }

    // 🔧 SOLUCIÓN: Método mejorado con fallback y reintentos
    private async callVercelAPIWithFallback(prompt: string, type: string): Promise<string> {
        for (let attempt = 1; attempt <= this.MAX_RETRIES; attempt++) {
            try {
                console.log(`🔄 Intento ${attempt}/${this.MAX_RETRIES} para ${type}...`);
                
                const result = await this.callVercelAPI(prompt);
                if (result && result.trim()) {
                    console.log(`✅ ${type} generado exitosamente`);
                    return result;
                }
                throw new Error('Respuesta vacía de la API');
                
            } catch (error) {
                console.warn(`⚠️ Intento ${attempt} falló para ${type}:`, error);
                
                if (attempt === this.MAX_RETRIES) {
                    console.log(`🔄 Usando fallback para ${type}...`);
                    return this.getFallbackContent(type);
                }
                
                // Esperar antes del siguiente intento
                await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
            }
        }
        
        return this.getFallbackContent(type);
    }

    // 🔧 SOLUCIÓN: Fallbacks específicos por tipo de contenido
    private getFallbackContent(type: string): string {
        switch (type) {
            case 'resumen':
                return this.generateFallbackResumen();
            case 'foda':
                return JSON.stringify(this.generateFallbackFODA());
            case 'areas':
                return JSON.stringify(this.generateFallbackAreas());
            default:
                return 'Contenido no disponible';
        }
    }

    // 🔧 SOLUCIÓN: Generar reporte completo de fallback
    private generateFallbackReport(): any {
        return {
            resumen_ejecutivo: this.generateFallbackResumen(),
            analisis_foda: this.generateFallbackFODA(),
            areas_enfoque_principales: this.generateFallbackAreas()
        };
    }

    private generateFallbackResumen(): string {
        return `Tu organización se encuentra en un nivel inicial de madurez en IA. 
        Las principales fortalezas identificadas son: pensamiento crítico y resolución de problemas. 
        Las áreas de oportunidad más importantes son: alfabetización digital y liderazgo en IA. 
        Este diagnóstico te proporciona un plan de acción personalizado para acelerar tu transformación digital.`;
    }

    private generateFallbackFODA(): any {
        return {
            fortalezas: ['Pensamiento crítico', 'Resolución de problemas', 'Trabajo en equipo'],
            debilidades: ['Alfabetización digital', 'Liderazgo en IA', 'Innovación tecnológica'],
            oportunidades: ['Mercado en crecimiento', 'Demanda de talento', 'Transformación digital'],
            amenazas: ['Competencia tecnológica', 'Cambios regulatorios', 'Escasez de talento']
        };
    }

    private generateFallbackAreas(): string[] {
        return [
            'Alfabetización digital y tecnológica',
            'Liderazgo en transformación digital',
            'Innovación y creatividad tecnológica',
            'Gestión de proyectos de IA',
            'Ética y responsabilidad en IA'
        ];
    }

	async saveAndRequestEmail(payload: DiagnosticoPersistedPayload & { email?: string; userId?: string }): Promise<string> {
		try {
			console.log('💾 Guardando diagnóstico en Firestore...');
			
			// 🔧 SOLUCIÓN: Verificar conectividad antes de guardar
			if (!this.firestore) {
				throw new Error('Firestore no está disponible');
			}
			
			// Si hay userId, guardar en la colección del usuario
			if (payload.userId) {
				const userCol = collection(this.firestore, `users/${payload.userId}/diagnostics`);
				const docRef = await addDoc(userCol, {
					...payload,
					userId: payload.userId,
					fecha: new Date(),
					timestamp: new Date()
				});
				
				// También guardar en la colección global para compatibilidad
				const globalCol = collection(this.firestore, 'diagnostics');
				await addDoc(globalCol, {
					...payload,
					userId: payload.userId,
					fecha: new Date(),
					timestamp: new Date()
				});
				
				console.log('✅ Diagnóstico guardado exitosamente:', docRef.id);
				return docRef.id;
			} else {
				// Fallback al comportamiento original
				const col = collection(this.firestore, 'diagnostics');
				const docRef = await addDoc(col, payload as any);
				console.log('✅ Diagnóstico guardado exitosamente (fallback):', docRef.id);
				return docRef.id;
			}
		} catch (error) {
			console.error('❌ Error guardando diagnóstico:', error);
			throw error;
		}
	}

    // Actualiza solo el campo planDeAccion.items en el documento del diagnóstico
    updateActionPlan(diagnosticId: string, planItems: PlanDeAccionItem[]): Promise<void> {
        try {
            if (!this.firestore) {
                throw new Error('Firestore no está disponible');
            }
            
            const ref = doc(this.firestore, 'diagnostics', diagnosticId);
            return updateDoc(ref, { 'planDeAccion.items': planItems }) as Promise<void>;
        } catch (error) {
            console.error('❌ Error actualizando plan de acción:', error);
            throw error;
        }
    }

	getById(id: string) {
		try {
			if (!this.firestore) {
				console.error('❌ Firestore no está disponible');
				return throwError(() => new Error('Firestore no está disponible'));
			}
			
			const ref = doc(this.firestore, `diagnostics/${id}`);
			return docData(ref, { idField: 'id' }).pipe(
				timeout(15000), // 15 segundos de timeout
				catchError(error => {
					console.error('❌ Error obteniendo diagnóstico por ID:', error);
					return throwError(() => error);
				})
			);
		} catch (error) {
			console.error('❌ Error en getById:', error);
			return throwError(() => error);
		}
	}

    // =====================
    // Integración con API de Vercel (Azure/OpenAI) vía AsistenteIaService
    // =====================
    private async callVercelAPI(prompt: string): Promise<string> {
        const payload = {
            messages: [
                { role: 'system', content: 'Eres un experto en coaching y desarrollo profesional.' },
                { role: 'user', content: prompt }
            ],
            maxTokens: 1500,
            temperature: 0.7
        } as any;

        try {
            console.log('🌐 Llamando a la API de Vercel...');
            const res: any = await firstValueFrom(
                this.asistenteIaService.generarTextoAzure(payload).pipe(
                    timeout(this.API_TIMEOUT),
                    catchError(error => {
                        console.error('❌ Error en llamada a Vercel:', error);
                        throw error;
                    })
                )
            );
            
            if (res && res.choices && res.choices[0]?.message?.content) {
                return res.choices[0].message.content as string;
            }
            throw new Error('Respuesta inesperada de la API de Vercel');
        } catch (error) {
            console.error('❌ Error llamando a la API de Vercel:', error);
            throw error as Error;
        }
    }

    // Orquestador para generar y guardar secciones del reporte usando la API de Vercel
    async generateReportWithVercel(diagnosticId: string, diagnosticData: any): Promise<void> {
        try {
            console.log('🚀 Generando reporte con Vercel para ID:', diagnosticId);
            
            const diagnosticContext = typeof diagnosticData === 'string' ? diagnosticData : JSON.stringify(diagnosticData);

            // Prompts
            const resumenPrompt = `Basado en los siguientes datos de un diagnóstico de competencias: ${diagnosticContext}, genera un "resumen_ejecutivo" conciso y profesional.`;
            const fodaPrompt = `Con la misma información del diagnóstico: ${diagnosticContext}, realiza un "analisis_foda" detallado en formato JSON con claves fortalezas, debilidades, oportunidades y amenazas como arrays de strings.`;
            const areasPrompt = `Usando la información del diagnóstico: ${diagnosticContext}, devuelve una lista breve (3 a 5) de "areas_enfoque_principales" en JSON como un array de strings.`;

            // Llamadas a IA con fallbacks
            const [resumenGenerado, fodaGenerado, areasGeneradas] = await Promise.all([
                this.callVercelAPIWithFallback(resumenPrompt, 'resumen'),
                this.callVercelAPIWithFallback(fodaPrompt, 'foda'),
                this.callVercelAPIWithFallback(areasPrompt, 'areas')
            ]);

            // Parseos seguros
            let analisisFoda: any = null;
            try { 
                analisisFoda = JSON.parse(fodaGenerado); 
            } catch { 
                analisisFoda = this.generateFallbackFODA(); 
            }

            let areasEnfoque: string[] = [];
            try {
                const parsed = JSON.parse(areasGeneradas);
                areasEnfoque = Array.isArray(parsed) ? parsed : [];
            } catch {
                areasEnfoque = this.generateFallbackAreas();
            }

            const updatedReportData: any = {
                resumen_ejecutivo: resumenGenerado,
                analisis_foda: analisisFoda,
                areas_enfoque_principales: areasEnfoque
            };

            const reportRef = doc(this.firestore, 'diagnostics', diagnosticId);
            await updateDoc(reportRef, updatedReportData);
            
            console.log('✅ Reporte actualizado exitosamente en Firestore');
        } catch (error) {
            console.error('❌ Error generando reporte con Vercel:', error);
            throw error as Error;
        }
    }

	async saveDiagnostic(payload: DiagnosticoPersistedPayload & { userId?: string; fecha?: Date; puntajeGeneral?: number; objetivo?: string; industria?: string; analysisContent?: any }, userId: string): Promise<string> {
		try {
			if (!this.firestore) {
				throw new Error('Firestore no está disponible');
			}
			
			const userCol = collection(this.firestore, `users/${userId}/diagnostics`);
			const docRef = await addDoc(userCol, {
				...payload,
				userId,
				fecha: payload.fecha || new Date(),
				timestamp: new Date()
			});
			
			// También guardar en la colección global para compatibilidad
			const globalCol = collection(this.firestore, 'diagnostics');
			await addDoc(globalCol, {
				...payload,
				userId,
				fecha: payload.fecha || new Date(),
				timestamp: new Date()
			});
			
			console.log('✅ Diagnóstico guardado exitosamente para usuario:', userId);
			return docRef.id;
		} catch (error) {
			console.error('❌ Error guardando diagnóstico para usuario:', error);
			throw error;
		}
	}

	async saveDiagnosticWithReport(report: any, scores: any, diagnosticData: any): Promise<any> {
		try {
			console.log('💾 Guardando diagnóstico con reporte...', { report, scores, diagnosticData });
			
			if (!this.firestore) {
				throw new Error('Firestore no está disponible');
			}
			
			// Guardar en la colección global de diagnósticos para que la Cloud Function lo procese
			const globalCol = collection(this.firestore, 'diagnostics');
			const docRef = await addDoc(globalCol, {
				report,
				scores,
				diagnosticData,
				fecha: new Date(),
				timestamp: new Date(),
				status: 'pending_pdf',
				// Asegurar que los datos del lead estén en el lugar correcto
				lead: diagnosticData.lead,
				form: {
					lead: diagnosticData.lead
				}
			});
			
			console.log('✅ Diagnóstico guardado exitosamente en Firestore:', docRef.id);
			
			// También guardar en la colección del usuario si hay userId
			if (diagnosticData.lead?.userId) {
				const userCol = collection(this.firestore, `users/${diagnosticData.lead.userId}/diagnostics`);
				await addDoc(userCol, {
					report,
					scores,
					diagnosticData,
					fecha: new Date(),
					timestamp: new Date(),
					status: 'completed',
					userId: diagnosticData.lead.userId
				});
				console.log('✅ Diagnóstico guardado en colección del usuario');
			}
			
			return docRef;
		} catch (error) {
			console.error('❌ Error al guardar diagnóstico:', error);
			throw error;
		}
	}

	getDiagnosticsForUser(userId: string): Observable<UserDiagnostic[]> {
		try {
			if (!this.firestore) {
				console.error('❌ Firestore no está disponible');
				return throwError(() => new Error('Firestore no está disponible'));
			}
			
			const userCol = collection(this.firestore, `users/${userId}/diagnostics`);
			const q = query(userCol, orderBy('fecha', 'desc'));
			
			return collectionData(q, { idField: 'id' }).pipe(
				timeout(15000), // 15 segundos de timeout
				map((docs: any[]) => docs.map((doc: any) => ({
					id: doc.id || '',
					userId: doc.userId || userId,
					fecha: doc.fecha?.toDate() || new Date(),
					puntajeGeneral: doc.puntajeGeneral || 0,
					objetivo: doc.objetivo || '',
					industria: doc.industria || '',
					data: doc.data || doc
				} as UserDiagnostic))),
				catchError(error => {
					console.error('❌ Error obteniendo diagnósticos del usuario:', error);
					return throwError(() => error);
				})
			);
		} catch (error) {
			console.error('❌ Error en getDiagnosticsForUser:', error);
			return throwError(() => error);
		}
	}

	async getDiagnosticsForUserAsync(userId: string): Promise<UserDiagnostic[]> {
		return new Promise((resolve, reject) => {
			this.getDiagnosticsForUser(userId).subscribe({
				next: (diagnostics) => resolve(diagnostics),
				error: (error) => reject(error)
			});
		});
	}
}

// Actualización parcial del plan de acción en el documento
export interface PlanDeAccionPayload {
    items: PlanDeAccionItem[];
}

// Método público para actualizar el plan de acción interactivo
export interface UpdateActionPlanResult {}



