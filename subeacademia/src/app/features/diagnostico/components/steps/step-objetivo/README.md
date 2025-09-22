# Componente de Objetivos - Rediseño

## Descripción

Este componente ha sido completamente rediseñado para proporcionar un flujo lógico más claro en la generación y selección de objetivos personalizados con IA.

## Flujo del Componente

### 1. **Paso de Input** (`currentStep === 'input'`)
- **Resumen del contexto**: Muestra automáticamente la información del cliente (industria, tamaño, presupuesto, segmento)
- **Formulario de meta principal**: Permite al usuario describir su objetivo principal con IA
- **Validación**: Requiere mínimo 10 caracteres para proceder
- **Botón de generación**: Activa la generación de objetivos con IA

### 2. **Paso de Generación** (`currentStep === 'generating'`)
- **Indicador de progreso**: Muestra el avance de la generación con pasos visuales
- **Pasos del proceso**:
  1. Analizando contexto (25%)
  2. Procesando diagnóstico ARES (50%)
  3. Evaluando competencias (75%)
  4. Generando objetivos (90%)
- **Integración con API de Vercel**: Utiliza el servicio especializado para generar objetivos personalizados

### 3. **Paso de Selección** (`currentStep === 'selection'`)
- **Objetivos generados**: Lista de objetivos personalizados con metadatos
- **Información de cada objetivo**:
  - Categoría con icono visual
  - Prioridad (alta/media/baja) con colores
  - Tiempo estimado de implementación
  - Impacto esperado
- **Selección múltiple**: Checkboxes para seleccionar objetivos
- **Navegación**: Botones para volver a editar o continuar

### 4. **Paso de Revisión** (`currentStep === 'review'`)
- **Confirmación visual**: Muestra el éxito en la configuración
- **Resumen**: Cantidad de objetivos seleccionados
- **Transición automática**: Navega al siguiente paso del diagnóstico

## Características Técnicas

### Integración con API de Vercel
- **Servicio especializado**: `VercelAiService` para generación de objetivos
- **Prompt inteligente**: Construye prompts basados en el contexto del cliente
- **Manejo de errores**: Fallback a objetivos predefinidos si falla la IA
- **Validación de respuesta**: Procesa y valida respuestas JSON de la IA

### Estado Reactivo
- **Signals de Angular**: Uso de `signal()` y `computed()` para estado reactivo
- **Flujo controlado**: Transiciones automáticas entre pasos
- **Persistencia**: Mantiene objetivos seleccionados en el estado global

### UI/UX Mejorada
- **Indicador de progreso visual**: Muestra el avance del flujo
- **Diseño responsivo**: Adaptable a diferentes tamaños de pantalla
- **Tema oscuro**: Soporte completo para modo oscuro
- **Animaciones**: Transiciones suaves entre estados

## Estructura de Datos

### ObjetivoGenerado
```typescript
interface ObjetivoGenerado {
  id: string;
  texto: string;
  categoria: string;
  prioridad: 'alta' | 'media' | 'baja';
  tiempoEstimado: string;
  impacto: string;
}
```

### ContextoCliente
```typescript
interface ContextoCliente {
  industria: string;
  tamano: string;
  presupuesto: string;
  segmento: string;
  descripcionUsuario: string;
  aresDebilidades: string[];
  aresFortalezas: string[];
  competenciasBajas: string[];
}
```

## Uso

1. **Importar el componente**:
```typescript
import { StepObjetivoComponent } from './step-objetivo.component';
```

2. **Incluir en las rutas**:
```typescript
{ path: 'objetivo', component: StepObjetivoComponent }
```

3. **El componente se integra automáticamente** con el flujo del diagnóstico

## Dependencias

- `VercelAiService`: Servicio para generación de objetivos con IA
- `DiagnosticStateService`: Servicio de estado del diagnóstico
- `ObjetivoProgressComponent`: Componente de progreso visual
- Angular Signals para estado reactivo
- Tailwind CSS para estilos

## Beneficios del Rediseño

1. **Flujo lógico claro**: El usuario entiende exactamente qué hacer en cada paso
2. **Mejor integración con IA**: Uso del servicio especializado de Vercel
3. **Experiencia visual mejorada**: Indicadores de progreso y transiciones suaves
4. **Manejo robusto de errores**: Fallback automático a opciones predefinidas
5. **Estado persistente**: Los objetivos seleccionados se mantienen durante la sesión
6. **Navegación intuitiva**: Botones claros para moverse entre pasos
