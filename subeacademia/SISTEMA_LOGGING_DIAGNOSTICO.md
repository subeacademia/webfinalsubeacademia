# 🔍 Sistema de Logging del Diagnóstico - SUBE Academia

## 📋 Resumen

Se ha implementado un sistema completo de logging para rastrear el flujo del diagnóstico y detectar errores en la conexión con la API de Vercel. Este sistema permite:

- **Rastrear cada paso** del flujo de diagnóstico
- **Monitorear llamadas a la API** en tiempo real
- **Detectar errores** con información detallada
- **Exportar logs** para análisis posterior
- **Panel de debug visual** integrado en la interfaz

## 🏗️ Arquitectura del Sistema

### 1. **GenerativeAiService** (`src/app/core/ai/generative-ai.service.ts`)
- **Logging detallado** de cada llamada a la API
- **Validación de datos** antes de enviar a la API
- **Manejo específico de errores HTTP** (500, 404, 0)
- **IDs únicos de solicitud** para rastreo
- **Método de diagnóstico** del servicio

### 2. **DiagnosticFlowLoggerService** (`src/app/core/services/diagnostic-flow-logger.service.ts`)
- **Rastreo automático** de navegación entre pasos
- **Captura de datos** en cada paso
- **Timeline completo** del flujo de diagnóstico
- **Exportación de logs** en formato JSON
- **Sanitización de datos** sensibles

### 3. **DebugPanelComponent** (`src/app/core/ui/debug-panel/debug-panel.component.ts`)
- **Panel flotante** en la interfaz de usuario
- **Estado en tiempo real** del flujo de diagnóstico
- **Acciones de debug** (exportar, diagnosticar, resetear)
- **Visualización de errores** recientes

## 🚀 Cómo Usar el Sistema

### **Para Desarrolladores**

#### 1. **Ver Logs en Consola**
```typescript
// Los logs aparecen automáticamente en la consola del navegador
// Prefijos identificables:
🤖 [GenerativeAI] - Servicio de IA
🔍 [DiagnosticFlow] - Flujo de diagnóstico
🔍 DiagnosticoComponent - Componente principal
🔍 EnhancedDiagnosticResults - Resultados del diagnóstico
```

#### 2. **Acceder al Panel de Debug**
- El panel aparece como un botón flotante azul en la esquina inferior derecha
- Click para abrir/cerrar
- Muestra estado en tiempo real del flujo

#### 3. **Exportar Logs**
```typescript
// Desde el panel de debug
📥 Exportar Logs

// O programáticamente
const flowLog = this.flowLogger.exportFlowLog();
```

#### 4. **Diagnosticar Servicio**
```typescript
// Desde el panel de debug
🔧 Diagnosticar Servicio

// O programáticamente
this.generativeAiService.diagnoseService();
```

### **Para Usuarios Finales**

El sistema es **transparente** para los usuarios finales. Solo ven:
- El flujo normal del diagnóstico
- Mensajes de error amigables si algo falla
- El panel de debug (opcional, para soporte técnico)

## 📊 Información Capturada

### **Por Cada Paso del Diagnóstico**
```json
{
  "step": "contexto",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "dataSnapshot": {
    "industria": "Tecnología",
    "tamano": "10-50 empleados",
    "presupuesto": "50k-100k"
  },
  "completionStatus": "completed",
  "metadata": {
    "stepType": "data_collection",
    "previousStep": "inicio",
    "nextStep": "ares"
  }
}
```

### **Por Cada Llamada a la API**
```json
{
  "step": "resultados",
  "apiDetails": {
    "url": "https://apisube-smoky.vercel.app/api/azure/generate",
    "method": "POST",
    "requestSize": 2048,
    "timestamp": "2024-01-15T10:35:00.000Z"
  },
  "response": {
    "responseTime": 2500,
    "analysisLength": 1500,
    "success": true
  }
}
```

### **Por Cada Error**
```json
{
  "step": "resultados",
  "error": {
    "error": "Error de conexión con la API",
    "timestamp": "2024-01-15T10:35:00.000Z"
  }
}
```

## 🔧 Solución de Problemas

### **Error 500 - Problema Interno del Servidor**
```typescript
// El sistema detecta automáticamente y sugiere:
"recommendation": "Verificar logs del servidor de Vercel y estado de la función"
```

### **Error 404 - Endpoint No Encontrado**
```typescript
// El sistema detecta automáticamente y sugiere:
"recommendation": "Verificar que la URL de la API sea correcta"
```

### **Error 0 - Problema de Conectividad**
```typescript
// El sistema detecta automáticamente y sugiere:
"recommendation": "Verificar conectividad de red y configuración CORS"
```

### **Datos de Diagnóstico Inválidos**
```typescript
// El sistema valida automáticamente:
- Nombre del lead
- Email del lead
- Industria especificada
- Respuestas del framework ARES
- Niveles de competencias
- Objetivo principal
```

## 📈 Métricas Disponibles

### **En Tiempo Real**
- Total de pasos del diagnóstico
- Pasos completados exitosamente
- Pasos que fallaron
- Estado general del flujo
- Tiempo de respuesta de la API
- Tamaño de las peticiones

### **En Reportes Exportados**
- Timeline completo de la sesión
- Duración de cada paso
- Errores detallados por paso
- Tasa de éxito general
- Resumen de la sesión

## 🛠️ Comandos de Debug

### **Desde la Consola del Navegador**

#### 1. **Ver Estado Actual del Logging**
```javascript
// En la consola del navegador
const debugPanel = document.querySelector('app-debug-panel');
if (debugPanel) {
  console.log(debugPanel.getCurrentLogStatus());
}
```

#### 2. **Exportar Logs Manualmente**
```javascript
// En la consola del navegador
const debugPanel = document.querySelector('app-debug-panel');
if (debugPanel) {
  debugPanel.exportLogs();
}
```

#### 3. **Diagnosticar Servicio**
```javascript
// En la consola del navegador
const debugPanel = document.querySelector('app-debug-panel');
if (debugPanel) {
  debugPanel.diagnoseService();
}
```

### **Desde el Código TypeScript**

#### 1. **Acceder al Servicio de Logging**
```typescript
constructor(private flowLogger: DiagnosticFlowLoggerService) {}

// Obtener logs actuales
const currentLogs = this.flowLogger.getCurrentFlowLog();

// Exportar logs
const exportedLogs = this.flowLogger.exportFlowLog();

// Resetear sesión
this.flowLogger.resetSession();
```

#### 2. **Acceder al Servicio de IA**
```typescript
constructor(private generativeAiService: GenerativeAiService) {}

// Diagnosticar servicio
this.generativeAiService.diagnoseService();
```

## 🔒 Seguridad y Privacidad

### **Datos Sanitizados Automáticamente**
- Emails convertidos a `[REDACTED]`
- Teléfonos convertidos a `[REDACTED]`
- Contraseñas y tokens nunca se registran
- Solo se capturan metadatos y estructura

### **Almacenamiento Local**
- Los logs se guardan en `localStorage` del navegador
- Se eliminan automáticamente al cerrar la sesión
- No se envían a servidores externos
- Solo para debugging local

## 📱 Interfaz de Usuario

### **Panel de Debug**
- **Posición**: Esquina inferior derecha
- **Acceso**: Botón flotante azul
- **Contenido**: Estado en tiempo real
- **Acciones**: Exportar, diagnosticar, resetear

### **Indicadores Visuales**
- **Verde**: Paso completado exitosamente
- **Amarillo**: Paso en progreso
- **Rojo**: Paso que falló
- **Azul**: Información general

## 🚨 Casos de Uso Comunes

### **1. Debugging de Errores de API**
```typescript
// El sistema automáticamente:
1. Detecta el tipo de error HTTP
2. Proporciona recomendaciones específicas
3. Registra contexto completo del error
4. Genera mensaje de fallback para el usuario
```

### **2. Análisis de Rendimiento**
```typescript
// El sistema captura:
- Tiempo de respuesta de cada paso
- Tamaño de las peticiones
- Duración total del diagnóstico
- Cuellos de botella identificados
```

### **3. Validación de Datos**
```typescript
// El sistema valida:
- Completitud de formularios
- Formato de datos
- Consistencia entre pasos
- Requisitos obligatorios
```

## 🔄 Mantenimiento

### **Limpieza Automática**
- Los logs se limpian al cerrar la sesión
- No hay acumulación de datos históricos
- El sistema se auto-gestiona

### **Actualizaciones**
- El panel se actualiza cada 2 segundos
- Los logs se generan en tiempo real
- No hay latencia en la captura de eventos

## 📞 Soporte Técnico

### **Información Disponible para Soporte**
- Session ID único para cada diagnóstico
- Timeline completo de eventos
- Logs detallados de errores
- Estado de cada paso del proceso
- Métricas de rendimiento

### **Cómo Ayudar a un Usuario**
1. **Solicitar Session ID** del diagnóstico
2. **Revisar logs exportados** para identificar el problema
3. **Usar panel de debug** para diagnóstico en tiempo real
4. **Verificar estado del servicio** con el botón de diagnóstico

## 🎯 Próximas Mejoras

### **Funcionalidades Planificadas**
- [ ] Integración con servicios de monitoreo externos
- [ ] Alertas automáticas para errores críticos
- [ ] Dashboard de analytics para administradores
- [ ] Integración con sistemas de tickets de soporte
- [ ] Machine learning para detección automática de patrones de error

### **Optimizaciones Técnicas**
- [ ] Compresión de logs para mejor rendimiento
- [ ] Filtros avanzados para búsqueda de eventos
- [ ] Exportación en múltiples formatos (CSV, Excel)
- [ ] API REST para acceso programático a logs
- [ ] Sistema de notificaciones push para errores críticos

---

## 📝 Notas de Implementación

Este sistema de logging fue implementado para resolver problemas específicos de conectividad con la API de Vercel y proporcionar visibilidad completa del flujo de diagnóstico. Está diseñado para ser:

- **No intrusivo** para los usuarios finales
- **Completo** en la captura de información
- **Fácil de usar** para desarrolladores y soporte técnico
- **Escalable** para futuras mejoras
- **Seguro** en el manejo de datos sensibles

Para cualquier pregunta o sugerencia sobre el sistema, contactar al equipo de desarrollo.
