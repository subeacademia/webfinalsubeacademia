import { Injectable } from '@angular/core';
import { AresScoresByDimension, DiagnosticoFormValue, DiagnosticoScores, NivelCompetencia } from '../data/diagnostic.models';
import { ARES_ITEMS } from '../data/ares-items';
import { NIVEL_TO_SCORE } from '../data/levels';
import { COMPETENCIAS } from '../data/competencias';
import { CoursesService } from '../../../core/data/courses.service';
import { PostsService } from '../../../core/data/posts.service';
// Importaciones de IA eliminadas - ahora se manejan en el componente
import { Observable, forkJoin, of, throwError, timer } from 'rxjs';
import { Course } from '../../../core/models/course.model';
import { Post } from '../../../core/models/post.model';
import { map, catchError, timeout, retry } from 'rxjs/operators';

export interface DiagnosticAnalysis {
    mainLevel: string;
    topStrengths: { name: string; level: string }[];
    topOpportunities: { name: string; level: string }[];
    aresAnalysis: { phase: string; score: number; interpretation: string }[];
    quickStartPlan: { day: string; task: string; focus: string }[];
}

export interface ActionPlan {
    reconocimientoFortalezas: string;
    areasDesarrollo: AreaDesarrollo[];
    recursos: RecursosRecomendados;
}

export interface AreaDesarrollo {
    competencia: string;
    importancia: string;
    acciones: string[];
}

export interface RecursosRecomendados {
    cursos: CursoRecomendado[];
    lectura: string;
}

export interface CursoRecomendado {
    titulo: string;
    descripcion: string;
    competenciasRelacionadas: string[];
    duracion: string;
}

export interface PersonalizedActionPlan {
    recommendedCourses: Course[];
    recommendedPosts: Post[];
    microActions: string[];
    aiGeneratedPlan?: string; // Plan de acción generado por IA
}

export type DiagnosticData = DiagnosticoFormValue;

@Injectable({ providedIn: 'root' })
export class ScoringService {
    constructor(
        private coursesService: CoursesService,
        private postsService: PostsService
    ) {}

    // Método principal para calcular puntajes de competencias
    calculateScores(diagnosticData: DiagnosticData): { name: string; score: number }[] {
        // Obtener todas las competencias disponibles
        const allCompetencies = COMPETENCIAS;
        
        if (!diagnosticData.competencias?.niveles) {
            // Si no hay datos, devolver todas las competencias con puntaje 0
            return allCompetencies.map(comp => ({
                name: comp.nameKey,
                score: 0
            }));
        }

        // Crear un mapa de todas las competencias con puntaje 0 por defecto
        const competencyMap = new Map<string, number>();
        allCompetencies.forEach(comp => {
            competencyMap.set(comp.nameKey, 0);
        });

        // Actualizar con los puntajes reales del usuario
        Object.entries(diagnosticData.competencias.niveles)
            .filter(([_, level]) => level !== null)
            .forEach(([competencyId, level]) => {
                const competency = allCompetencies.find(c => c.id === competencyId);
                if (competency) {
                    const score = this.getCompetencyScore(level as string);
                    competencyMap.set(competency.nameKey, score);
                }
            });

        // Convertir el mapa a array y ordenar por puntaje descendente
        const result = Array.from(competencyMap.entries())
            .map(([name, score]) => ({ name, score }))
            .sort((a, b) => b.score - a.score);
            
        console.log('📊 Scores de competencias calculados:', result);
        return result;
    }

    // Método eliminado para evitar confusión en el flujo de datos
    // La lógica de IA ahora se maneja directamente en el componente

    // Método eliminado - la lógica de IA ahora se maneja en el componente

    private getTopCompetencies(userData: any): { name: string; score: number }[] {
        // Lógica para obtener las competencias más altas del usuario
        const competencias = userData.competencias || {};
        const scores = Object.entries(competencias).map(([name, level]) => ({
            name,
            score: this.getCompetencyScore(level as string)
        }));
        
        return scores.sort((a, b) => b.score - a.score).slice(0, 3);
    }

    private getLowestCompetencies(userData: any): { name: string; score: number }[] {
        // Lógica para obtener las competencias más bajas del usuario
        const competencias = userData.competencias || {};
        const scores = Object.entries(competencias).map(([name, level]) => ({
            name,
            score: this.getCompetencyScore(level as string)
        }));
        
        return scores.sort((a, b) => a.score - b.score).slice(0, 3);
    }

    private getCompetencyScore(level: string | number): number {
        console.log(`🔍 getCompetencyScore llamado con nivel: ${level}, tipo: ${typeof level}`);
        
        let score: number;
        
        // Si es un número (1-5), convertirlo directamente a score (0-100)
        if (typeof level === 'number') {
            if (level >= 1 && level <= 5) {
                score = Math.round((level / 5) * 100);
                console.log(`📊 Nivel numérico ${level} convertido a score ${score}`);
            } else {
                score = 0;
                console.warn(`⚠️ Nivel numérico ${level} fuera de rango, score = 0`);
            }
        } else {
            // Si es un string, usar el mapeo existente
            const scoreMap: { [key: string]: number } = {
                'incipiente': 20,
                'basico': 40,
                'intermedio': 60,
                'avanzado': 80,
                'lider': 100
            };
            
            score = scoreMap[level] || 0;
            console.log(`📊 Nivel string "${level}" mapeado a score ${score}`);
        }
        
        console.log(`📊 Nivel ${level} mapeado a score ${score}`);
        return score;
    }

    private generateFallbackActionPlan(): string {
        return `## 🎯 Plan de Acción Personalizado Generado Localmente

### 🚀 Micro-acciones para Esta Semana

1. **📚 Esta semana, dedica 15 minutos a leer uno de los artículos recomendados** sobre las competencias que quieres desarrollar. Aplica una técnica aprendida en tu trabajo diario y documenta el resultado en un pequeño diario de aprendizaje.

2. **🔄 Identifica una tarea en tu trabajo donde puedas aplicar conscientemente una de tus competencias más fuertes para apoyar una más débil**. Combina ambas para crear sinergias. Por ejemplo, si eres bueno en análisis pero quieres mejorar la comunicación, estructura una presentación usando tu pensamiento analítico.

3. **📅 Programa una sesión de 30 minutos para revisar y actualizar tu plan de desarrollo profesional**, enfocándote en cómo tus fortalezas pueden acelerar el desarrollo de tus áreas de oportunidad. Establece 3 metas específicas y medibles para el próximo mes.

### 💡 Consejos de Implementación

- **⏰ Establece recordatorios** en tu calendario para cada micro-acción
- **📝 Reflexiona al final de cada día** sobre cómo aplicaste lo aprendido
- **🤝 Comparte tus aprendizajes** con tu equipo para multiplicar el impacto
- **🎯 Mide tu progreso** con indicadores simples (ej: número de veces que aplicaste una competencia)

### 🚀 Próximos Pasos

Una vez que hayas completado estas micro-acciones, estarás listo para el siguiente nivel de tu desarrollo profesional. Recuerda que el crecimiento es un proceso continuo y cada pequeño paso cuenta.

### 🔧 Herramientas Recomendadas

- **📱 Aplicaciones de productividad**: Trello, Notion, o Microsoft To Do
- **📚 Plataformas de aprendizaje**: Coursera, LinkedIn Learning, o artículos especializados
- **📊 Seguimiento**: Mantén un registro semanal de tus logros y aprendizajes

---

*💡 **Nota**: Este plan de acción fue generado localmente para garantizar una experiencia inmediata. Los insights están basados en las mejores prácticas de desarrollo profesional y coaching ejecutivo.*`;
    }

    private generateMicroActions(): string[] {
        return [
            'Esta semana, dedica 15 minutos a leer uno de los artículos recomendados',
            'Identifica una tarea en tu trabajo donde puedas aplicar conscientemente una de tus competencias más fuertes para apoyar una más débil',
            'Programa una sesión de 30 minutos para revisar y actualizar tu plan de desarrollo profesional'
        ];
    }

    computeAresScore(form: DiagnosticoFormValue): AresScoresByDimension & { promedio: number } {
        // Regla simple: promedio por dimensión de valores 1-5, 0 se excluye; escala a 0-100.
        const byDim: Record<string, number[]> = {};
        console.log('🔍 Datos ARES recibidos en scoring:', form.ares);
        console.log('🔍 ARES_ITEMS disponibles:', ARES_ITEMS);
        
        // Si no hay datos ARES, devolver scores vacíos
        if (!form.ares || Object.keys(form.ares).length === 0) {
            console.warn('⚠️ No hay datos ARES para procesar');
            return { promedio: 0 } as any;
        }
        
        for (const item of ARES_ITEMS) {
            const raw = (form.ares as any)?.[item.id] ?? null;
            console.log(`🔍 Procesando item ARES ${item.id}: valor=${raw}, dimensión=${item.dimension}`);
            if (raw === null || raw === 0) continue; // 0 = N/A
            if (!byDim[item.dimension]) byDim[item.dimension] = [];
            byDim[item.dimension].push(Number(raw));
        }
        
        console.log('🔍 Datos agrupados por dimensión:', byDim);
        
        const scores: AresScoresByDimension = {};
        let sumAll = 0;
        let countAll = 0;
        
        for (const [dim, values] of Object.entries(byDim)) {
            const avg = values.length ? values.reduce((a, b) => a + b, 0) / values.length : 0;
            const score = Math.round((avg / 5) * 100);
            scores[dim] = score;
            sumAll += score;
            countAll += 1;
            console.log(`📊 Dimensión ${dim}: valores=${values}, promedio=${avg}, score=${score}`);
        }
        
        const promedio = countAll ? Math.round(sumAll / countAll) : 0;
        console.log('📈 Scores ARES calculados:', { scores, promedio });
        return { ...scores, promedio } as any;
    }

    computeCompetencyScores(form: DiagnosticoFormValue): DiagnosticoScores['competencias'] {
        // Mapea nivel autoevaluado -> puntaje
        // El estado devuelve competencias directamente desde competenciasForm
        const niveles = form?.competencias ?? {};
        console.log('🔍 Datos de competencias recibidos en scoring:', niveles);
        console.log('🔍 Form completo recibido:', form);
        console.log('🔍 Tipos de datos:', {
            competencias: typeof niveles,
            keys: Object.keys(niveles),
            values: Object.values(niveles)
        });
        
        // Si no hay datos, devolver TODAS las competencias con puntaje 0 para garantizar visualización del gráfico
        if (Object.keys(niveles).length === 0) {
            console.warn('⚠️ No hay datos de competencias para procesar. Devolviendo todas las competencias con puntaje 0.');
            return COMPETENCIAS.map(comp => ({
                competenciaId: comp.id,
                puntaje: 0,
                nivel: 'incipiente' as NivelCompetencia
            }));
        }
        
        const out = Object.entries(niveles).map(([competenciaId, nivel]) => {
            console.log(`🔍 Procesando competencia ${competenciaId}: nivel=${nivel}, tipo=${typeof nivel}`);
            // Usar el método privado getCompetencyScore en lugar de NIVEL_TO_SCORE directamente
            const puntaje = nivel ? this.getCompetencyScore(nivel) : 0;
            console.log(`📊 Competencia ${competenciaId}: nivel=${nivel}, puntaje=${puntaje}`);
            return { competenciaId, puntaje, nivel: (nivel || 'incipiente') as NivelCompetencia };
        });
        
        console.log('📈 Scores de competencias calculados:', out);
        // Ordenar desc por puntaje para consistencia
        return out.sort((a, b) => b.puntaje - a.puntaje);
    }

    generateDiagnosticAnalysis(data: DiagnosticData): DiagnosticAnalysis {
        const ares = this.computeAresScore(data);
        const competencias = this.computeCompetencyScores(data);

        // Main level a partir del promedio de competencias (si no hay, usar ARES promedio)
        const promComp = competencias.length
            ? Math.round(competencias.reduce((a, c) => a + c.puntaje, 0) / competencias.length)
            : ares.promedio;
        const mainLevel = this.mapScoreToLevel(promComp);

        // Top 3 fortalezas y 3 oportunidades
        const topStrengths = competencias.slice(0, 3).map(c => ({
            name: (COMPETENCIAS.find(k => k.id === c.competenciaId)?.nameKey || c.competenciaId),
            level: this.mapScoreToLevel(c.puntaje),
        }));
        const opportunitiesSorted = [...competencias].sort((a, b) => a.puntaje - b.puntaje).slice(0, 3);
        const topOpportunities = opportunitiesSorted.map(c => ({
            name: (COMPETENCIAS.find(k => k.id === c.competenciaId)?.nameKey || c.competenciaId),
            level: this.mapScoreToLevel(c.puntaje),
        }));

        // ARES phases aggregation
        const phaseMap: Record<string, string[]> = {
            'F1 - Preparación': ['datos', 'talento', 'gobernanza'],
            'F2 - Diseño': ['valor', 'etica', 'riesgos', 'transparencia'],
            'F3 - Desarrollo': ['tecnologia', 'integracion', 'capacidad'],
            'F4 - Operación': ['operacion', 'seguridad', 'cumplimiento'],
            'F5 - Escalamiento': ['adopcion', 'sostenibilidad'],
        };
        const aresAnalysis = Object.entries(phaseMap).map(([phase, dims]) => {
            const vals = dims.map(d => (ares as any)[d] ?? 0);
            const score = vals.length ? Math.round(vals.reduce((a, b) => a + b, 0) / vals.length) : 0;
            return { phase, score, interpretation: this.interpretPhase(phase, score) };
        });

        const quickStartPlan = this.buildQuickStartPlan(data.segmento || 'startup', data.objetivo || 'eficiencia');

        return { mainLevel, topStrengths, topOpportunities, aresAnalysis, quickStartPlan };
    }

    generateActionPlan(data: DiagnosticData): ActionPlan {
        const competencias = this.computeCompetencyScores(data);
        
        // Obtener las 3 competencias con mayor puntaje (fortalezas)
        const topStrengths = competencias.slice(0, 3);
        
        // Obtener las 3 competencias con menor puntaje (áreas de desarrollo)
        const areasDesarrollo = [...competencias].sort((a, b) => a.puntaje - b.puntaje).slice(0, 3);
        
        // Generar reconocimiento de fortalezas
        const reconocimientoFortalezas = this.generateReconocimientoFortalezas(topStrengths, areasDesarrollo, data);
        
        // Generar áreas de desarrollo con acciones específicas
        const areasDesarrolloDetalladas = areasDesarrollo.map(area => 
            this.generateAreaDesarrollo(area, data)
        );
        
        // Generar recursos recomendados
        const recursos = this.generateRecursosRecomendados(areasDesarrollo, data);
        
        return {
            reconocimientoFortalezas,
            areasDesarrollo: areasDesarrolloDetalladas,
            recursos
        };
    }

    private mapScoreToLevel(score: number): string {
        if (score >= 85) return 'Líder';
        if (score >= 70) return 'Avanzado';
        if (score >= 50) return 'Practicante';
        if (score >= 30) return 'Principiante';
        return 'Inicial';
    }

    private interpretPhase(phase: string, score: number): string {
        if (score >= 70) return `${phase}: Fortaleza sólida. Mantener métricas y escalar con gobernanza.`;
        if (score >= 50) return `${phase}: Base aceptable. Prioriza mejoras incrementales y documentación.`;
        if (score >= 30) return `${phase}: Oportunidad clave. Define responsables, KPIs y pilotos focalizados.`;
        return `${phase}: Urgente. Establece fundamentos (diagnóstico, gobierno de datos, políticas ARES).`;
    }

    private buildQuickStartPlan(segment: string, objetivo: string): { day: string; task: string; focus: string }[] {
        const base: { day: string; task: string; focus: string }[] = [
            { day: '1-2', task: 'Inventariar 3 procesos clave candidatos para IA.', focus: 'F1 - Preparación' },
            { day: '3-4', task: 'Definir KPIs de éxito y riesgos/ética para un piloto.', focus: 'F2 - Diseño' },
            { day: '5-6', task: 'Seleccionar herramientas y diseñar arquitectura del piloto.', focus: 'F3 - Desarrollo' },
            { day: '7-9', task: 'Construir PoC con datos reales y pruebas controladas.', focus: 'F3 - Desarrollo' },
            { day: '10-11', task: 'Plan de operación: monitoreo, alertas y retraining.', focus: 'F4 - Operación' },
            { day: '12', task: 'Definir comité ARES y checklist de cumplimiento.', focus: 'F4 - Operación' },
            { day: '13-14', task: 'Presentar resultados, lecciones y roadmap de escalamiento.', focus: 'F5 - Escalamiento' },
        ];

        if (objetivo === 'eficiencia') {
            base[0].task = 'Identificar 3 procesos repetitivos para automatizar con IA.';
            base[3].task = 'Construir PoC de automatización/agentización con métricas de tiempo/ahorro.';
        } else if (objetivo === 'crecimiento') {
            base[0].task = 'Identificar 3 palancas de crecimiento (captación, activación, retención).';
            base[3].task = 'PoC de growth con IA (personalización, scoring de leads, contenidos).';
        } else if (objetivo === 'innovacion') {
            base[0].task = 'Mapear 3 hipótesis de alto impacto para nuevos productos/servicios con IA.';
            base[3].task = 'PoC exploratoria validando factibilidad técnica y valor percibido.';
        } else if (objetivo === 'experienciaCliente') {
            base[0].task = 'Auditar journey y puntos de fricción del cliente.';
            base[3].task = 'PoC de asistente/soporte con IA y feedback loop de calidad.';
        }

        // Ajustes por segmento
        if (segment === 'startup') {
            base.push({ day: 'Extra', task: 'Preparar pitch de resultados para inversores/aliados.', focus: 'F5 - Escalamiento' });
        } else if (segment === 'corporativo') {
            base[1].task = base[1].task + ' Alinear con compliance y seguridad.';
        }
        return base;
    }

    private generateReconocimientoFortalezas(
        fortalezas: any[], 
        areasDesarrollo: any[], 
        data: DiagnosticData
    ): string {
        const fortalezaNames = fortalezas.map(f => 
            COMPETENCIAS.find(c => c.id === f.competenciaId)?.nameKey || f.competenciaId
        );
        
        const areaNames = areasDesarrollo.map(a => 
            COMPETENCIAS.find(c => c.id === a.competenciaId)?.nameKey || a.competenciaId
        );
        
        const segmento = data.segmento || 'empresa';
        const industria = data.contexto?.industria || 'General';
        
        return `Tus fortalezas en ${fortalezaNames.join(', ')} te posicionan de manera excepcional para liderar la transformación digital en ${industria}. Estas competencias sólidas pueden ser utilizadas como palancas estratégicas para desarrollar ${areaNames.join(', ')}, creando un círculo virtuoso de crecimiento profesional y organizacional. Tu perfil ${segmento} te permite aprovechar estas fortalezas de manera única, combinando experiencia práctica con visión estratégica.`;
    }

    private generateAreaDesarrollo(area: any, data: DiagnosticData): AreaDesarrollo {
        const competenciaName = COMPETENCIAS.find(c => c.id === area.competenciaId)?.nameKey || area.competenciaId;
        const segmento = data.segmento || 'empresa';
        const industria = data.contexto?.industria || 'General';
        
        const importancia = this.generateImportanciaCompetencia(area.competenciaId, segmento, industria);
        const acciones = this.generateAccionesCompetencia(area.competenciaId, segmento);
        
        return {
            competencia: competenciaName,
            importancia,
            acciones
        };
    }

    private generateImportanciaCompetencia(competenciaId: string, segmento: string, industria: string): string {
        const contextos = {
            'c1_pensamiento_critico': `En ${industria}, el pensamiento crítico es fundamental para analizar datos complejos, evaluar riesgos y tomar decisiones estratégicas que impacten positivamente en los resultados del negocio.`,
            'c2_resolucion_problemas': `La resolución de problemas complejos es clave para identificar oportunidades de mejora, optimizar procesos y desarrollar soluciones innovadoras que diferencien a tu organización en ${industria}.`,
            'c3_alfabetizacion_datos': `En la era de la IA, la alfabetización de datos es esencial para interpretar métricas, identificar patrones y tomar decisiones basadas en evidencia que impulsen el crecimiento en ${industria}.`,
            'c4_comunicacion': `La comunicación efectiva es vital para alinear equipos, presentar propuestas a stakeholders y transmitir la visión estratégica de transformación digital en ${industria}.`,
            'c5_colaboracion': `La colaboración efectiva permite aprovechar la diversidad de talentos, fomentar la innovación y crear sinergias que aceleren la adopción de IA en ${industria}.`,
            'c6_creatividad': `La creatividad e innovación son fundamentales para identificar nuevas oportunidades de negocio, diseñar soluciones disruptivas y mantener la competitividad en ${industria}.`,
            'c7_diseno_tecnologico': `El diseño tecnológico es crucial para crear soluciones de IA que sean escalables, mantenibles y que generen valor real para los usuarios y la organización en ${industria}.`,
            'c8_automatizacion_agentes': `La automatización y los agentes de IA son palancas clave para mejorar la eficiencia operativa, reducir costos y liberar talento humano para tareas de mayor valor en ${industria}.`,
            'c9_seguridad_privacidad': `En ${industria}, la seguridad y privacidad son fundamentales para proteger datos sensibles, cumplir regulaciones y mantener la confianza de clientes y stakeholders.`,
            'c10_etica_responsabilidad': `La ética y responsabilidad en IA son esenciales para asegurar que las soluciones tecnológicas beneficien a la sociedad y mantengan la reputación de la organización en ${industria}.`,
            'c11_sostenibilidad': `La sostenibilidad es clave para crear valor a largo plazo, reducir el impacto ambiental y asegurar la viabilidad futura del negocio en ${industria}.`,
            'c12_aprendizaje_continuo': `El aprendizaje continuo es fundamental para mantenerse actualizado con las últimas tecnologías y tendencias que transforman ${industria}.`,
            'c13_liderazgo_ia': `El liderazgo en IA es crucial para guiar equipos, inspirar la innovación y crear una cultura organizacional que abrace la transformación digital en ${industria}.`
        };
        
        return contextos[competenciaId as keyof typeof contextos] || `Esta competencia es fundamental para el éxito en ${industria} y el desarrollo profesional en el contexto actual.`;
    }

    private generateAccionesCompetencia(competenciaId: string, segmento: string): string[] {
        const acciones = {
            'c1_pensamiento_critico': [
                'Dedica 15 minutos diarios a analizar críticamente una decisión o problema del día. Escribe tus reflexiones y alternativas consideradas.',
                'Al final de cada semana, revisa 3 decisiones tomadas y evalúa qué podrías haber hecho diferente basándote en nueva información.',
                'Practica el método de los "5 por qué" en situaciones complejas para llegar a la raíz del problema antes de proponer soluciones.'
            ],
            'c2_resolucion_problemas': [
                'Implementa un sistema de registro de problemas que incluya contexto, impacto, soluciones intentadas y resultados obtenidos.',
                'Dedica 30 minutos semanales a resolver un problema complejo usando técnicas como lluvia de ideas, mapas mentales o análisis de causa-efecto.',
                'Colabora con colegas de diferentes áreas para abordar problemas desde múltiples perspectivas y generar soluciones más robustas.'
            ],
            'c3_alfabetizacion_datos': [
                'Crea un dashboard personal con 3-5 métricas clave de tu área de trabajo. Revisa y actualiza diariamente durante 21 días.',
                'Analiza un conjunto de datos semanalmente usando herramientas básicas como Excel o Google Sheets. Identifica al menos 3 insights.',
                'Participa en sesiones de análisis de datos con tu equipo, preguntando sobre metodologías, fuentes de datos y validez de conclusiones.'
            ],
            'c4_comunicacion': [
                'Al final de cada reunión, dedica 2 minutos para resumir los puntos clave y las acciones a seguir. Pide feedback sobre tu claridad.',
                'Practica la comunicación asertiva: expresa tus ideas de manera clara, respeta las opiniones de otros y busca puntos de encuentro.',
                'Desarrolla presentaciones de 5 minutos sobre temas de tu expertise. Graba y revisa para identificar áreas de mejora.'
            ],
            'c5_colaboracion': [
                'Inicia al menos una colaboración interdepartamental por mes. Documenta aprendizajes y mejores prácticas identificadas.',
                'Organiza sesiones de brainstorming semanales con tu equipo usando técnicas como "6-3-5" o "brainwriting" para fomentar la participación.',
                'Implementa un sistema de reconocimiento de contribuciones del equipo, destacando el trabajo colaborativo y los logros compartidos.'
            ],
            'c6_creatividad': [
                'Dedica 20 minutos diarios a explorar nuevas ideas o soluciones. Mantén un "diario de creatividad" con tus reflexiones.',
                'Participa en sesiones de innovación donde se generen al menos 10 ideas locas antes de evaluar su viabilidad.',
                'Experimenta con técnicas de pensamiento lateral como analogías, inversión de problemas o cambio de perspectiva.'
            ],
            'c7_diseno_tecnologico': [
                'Diseña un prototipo de baja fidelidad para una solución tecnológica que resuelva un problema real de tu organización.',
                'Participa en hackathons o sesiones de diseño de soluciones tecnológicas con equipos multidisciplinarios.',
                'Documenta el proceso de diseño de una solución tecnológica, incluyendo requisitos, alternativas consideradas y decisiones de diseño.'
            ],
            'c8_automatizacion_agentes': [
                'Identifica 3 procesos repetitivos en tu trabajo diario y diseña un plan de automatización usando herramientas disponibles.',
                'Experimenta con chatbots o agentes de IA para automatizar respuestas frecuentes o tareas de soporte básico.',
                'Implementa un piloto de automatización en un proceso de bajo riesgo y documenta aprendizajes y métricas de mejora.'
            ],
            'c9_seguridad_privacidad': [
                'Revisa y actualiza las políticas de seguridad de tu área de trabajo. Identifica al menos 3 mejoras implementables.',
                'Participa en simulacros de incidentes de seguridad para familiarizarte con protocolos de respuesta y recuperación.',
                'Implementa controles de acceso y auditoría en al menos un sistema o proceso crítico de tu responsabilidad.'
            ],
            'c10_etica_responsabilidad': [
                'Desarrolla una guía ética para el uso de IA en tu organización, considerando principios de transparencia, equidad y responsabilidad.',
                'Organiza sesiones de discusión sobre dilemas éticos relacionados con la tecnología en tu industria.',
                'Implementa un proceso de revisión ética para nuevas iniciativas tecnológicas, incluyendo evaluación de impacto y mitigación de riesgos.'
            ],
            'c11_sostenibilidad': [
                'Conducta una auditoría de sostenibilidad en tu área de trabajo, identificando al menos 5 oportunidades de mejora.',
                'Implementa al menos una iniciativa de sostenibilidad por trimestre, midiendo impacto y documentando aprendizajes.',
                'Desarrolla un plan de acción de sostenibilidad a 12 meses para tu área, incluyendo objetivos medibles y responsables.'
            ],
            'c12_aprendizaje_continuo': [
                'Dedica 30 minutos diarios al aprendizaje estructurado. Usa plataformas como Coursera, edX o recursos internos de tu organización.',
                'Participa en al menos una comunidad de práctica o grupo de interés relacionado con tu campo profesional.',
                'Documenta tu aprendizaje en un portafolio digital que incluya proyectos, certificaciones y reflexiones sobre tu desarrollo profesional.'
            ],
            'c13_liderazgo_ia': [
                'Lidera al menos una iniciativa de transformación digital en tu equipo, estableciendo visión, objetivos y métricas de éxito.',
                'Mentorea a colegas en el desarrollo de competencias de IA, creando un plan de desarrollo personalizado para cada uno.',
                'Desarrolla y presenta una estrategia de adopción de IA para tu área de trabajo, incluyendo roadmap, recursos necesarios y plan de cambio.'
            ]
        };
        
        return acciones[competenciaId as keyof typeof acciones] || [
            'Identifica 3 oportunidades específicas para desarrollar esta competencia en tu contexto actual.',
            'Busca un mentor o coach que te ayude a crear un plan de desarrollo personalizado.',
            'Establece métricas mensurables para evaluar tu progreso en esta competencia.'
        ];
    }

    private generateRecursosRecomendados(areasDesarrollo: any[], data: DiagnosticData): RecursosRecomendados {
        const cursos = this.generateCursosRecomendados(areasDesarrollo);
        const lectura = this.generateLecturaRecomendada(areasDesarrollo, data);
        
        return { cursos, lectura };
    }

    private generateCursosRecomendados(areasDesarrollo: any[]): CursoRecomendado[] {
        const competenciasIds = areasDesarrollo.map(a => a.competenciaId);
        
        const cursosDisponibles: CursoRecomendado[] = [
            {
                titulo: 'Fundamentos de IA para Líderes',
                descripcion: 'Curso introductorio que cubre conceptos básicos de IA, casos de uso empresariales y estrategias de implementación.',
                competenciasRelacionadas: ['c13_liderazgo_ia', 'c3_alfabetizacion_datos', 'c8_automatizacion_agentes'],
                duracion: '8 semanas'
            },
            {
                titulo: 'Transformación Digital y Cambio Organizacional',
                descripcion: 'Programa integral que aborda la gestión del cambio, liderazgo transformacional y desarrollo de competencias digitales.',
                competenciasRelacionadas: ['c13_liderazgo_ia', 'c4_comunicacion', 'c5_colaboracion'],
                duracion: '12 semanas'
            },
            {
                titulo: 'Ética y Gobernanza en IA',
                descripcion: 'Curso especializado en principios éticos, marcos regulatorios y mejores prácticas para el uso responsable de IA.',
                competenciasRelacionadas: ['c10_etica_responsabilidad', 'c9_seguridad_privacidad', 'c1_pensamiento_critico'],
                duracion: '6 semanas'
            },
            {
                titulo: 'Innovación y Creatividad en la Era Digital',
                descripcion: 'Programa que desarrolla habilidades de pensamiento creativo, resolución de problemas y diseño de soluciones innovadoras.',
                competenciasRelacionadas: ['c6_creatividad', 'c2_resolucion_problemas', 'c7_diseno_tecnologico'],
                duracion: '10 semanas'
            },
            {
                titulo: 'Sostenibilidad y Tecnología Verde',
                descripcion: 'Curso que explora cómo la tecnología puede contribuir a la sostenibilidad y el desarrollo de soluciones eco-eficientes.',
                competenciasRelacionadas: ['c11_sostenibilidad', 'c7_diseno_tecnologico', 'c1_pensamiento_critico'],
                duracion: '8 semanas'
            }
        ];
        
        // Filtrar cursos más relevantes basados en las competencias a desarrollar
        const cursosRelevantes = cursosDisponibles.filter(curso => 
            curso.competenciasRelacionadas.some(comp => competenciasIds.includes(comp))
        );
        
        // Retornar los 2 cursos más relevantes
        return cursosRelevantes.slice(0, 2);
    }

    private generateLecturaRecomendada(areasDesarrollo: any[], data: DiagnosticData): string {
        const competenciasIds = areasDesarrollo.map(a => a.competenciaId);
        const segmento = data.segmento || 'empresa';
        
        if (competenciasIds.includes('c13_liderazgo_ia') || competenciasIds.includes('c4_comunicacion')) {
            return 'Libro: "Leading Digital" de George Westerman - Estrategias para liderar la transformación digital en organizaciones.';
        } else if (competenciasIds.includes('c3_alfabetizacion_datos') || competenciasIds.includes('c8_automatizacion_agentes')) {
            return 'Artículo: "The AI-Powered Organization" de Harvard Business Review - Cómo estructurar organizaciones para maximizar el valor de la IA.';
        } else if (competenciasIds.includes('c10_etica_responsabilidad') || competenciasIds.includes('c9_seguridad_privacidad')) {
            return 'Libro: "Weapons of Math Destruction" de Cathy O\'Neil - Análisis crítico sobre el uso ético de algoritmos y datos.';
        } else if (competenciasIds.includes('c6_creatividad') || competenciasIds.includes('c2_resolucion_problemas')) {
            return 'Artículo: "Design Thinking for Innovation" de MIT Sloan - Metodologías para fomentar la creatividad y resolución de problemas complejos.';
        } else {
            return 'Libro: "The Fourth Industrial Revolution" de Klaus Schwab - Visión integral sobre la transformación tecnológica y sus implicaciones.';
        }
    }
}


