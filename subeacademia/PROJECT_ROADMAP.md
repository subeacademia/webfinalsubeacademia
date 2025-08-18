# 🗺️ Roadmap de SubeAcademia.cl

## 1. Resumen del Proyecto

**Descripción**: Plataforma de diagnóstico de madurez de IA para empresas y profesionales, basada en la metodología ARES y las 13 competencias de Sube Academia.

**Stack Tecnológico**: Angular (Frontend), Firebase (Backend: Firestore, Storage, Functions, Auth), API de Google Gemini (IA Generativa).

**Objetivo Principal**: Ofrecer un diagnóstico gratuito, generar un reporte automatizado con un plan de acción y posicionar a Sube Academia como líder en la materia.

## 2. Estado Actual: Funcionalidades Implementadas

### ✅ Sistema de Diagnóstico Multi-paso
- **Interfaz de Usuario Completa**: Implementada la interfaz de usuario para la recolección de datos en varias etapas (step-lead, step-contexto, step-objetivo, step-segmento, step-ares, step-competencias).
- **Componentes UI Avanzados**: Slider interactivo reemplazando botones de radio tradicionales, modal de información detallada, soporte completo para dark/light mode.
- **Internacionalización**: Soporte completo para Español, Inglés y Portugués con cambio dinámico de idioma.

### ✅ Integración con IA Generativa
- **Servicio Gemini**: Existe un servicio (`generative-ai.service.ts`) que consume el API de Gemini para procesar los resultados del diagnóstico.
- **Prompt Mejorado**: Prompt estructurado que genera análisis profundo de todas las dimensiones ARES-AI (15 dimensiones).
- **Plan de Acción Dinámico**: Generación de plan de acción con 2 áreas de mejora y múltiples pasos, incluyendo recomendaciones de cursos.

### ✅ Visualización de Resultados
- **Componentes de Resultados**: Componentes básicos para mostrar los resultados, incluyendo gráfico de radar, semáforo ARES y análisis detallado.
- **Plan de Acción Personalizado**: Sección "Tu Plan de Acción Personalizado" con cursos recomendados, artículos y micro-acciones.
- **Exportación a PDF**: Generación automática de PDF profesional con branding de Sube Academia.

### ✅ Panel de Administración
- **Estructura Completa**: Esqueleto completo del panel de administración para gestionar contenido (cursos, posts, proyectos, media, logos, settings).
- **Gestión de Cursos**: CRUD completo con asociación de competencias relacionadas.
- **Gestión de Posts**: CRUD completo con asociación de competencias relacionadas.
- **Gestión de Media**: Sistema de gestión de archivos multimedia.

### ✅ Autenticación y Seguridad
- **Sistema de Autenticación**: Implementado con Firebase Auth, incluyendo guards para admin y usuarios.
- **Reglas de Firestore**: Configuración básica de seguridad con permisos diferenciados por rol.
- **Reglas de Storage**: Configuración de seguridad para archivos con permisos diferenciados.

### ✅ Cloud Functions
- **Generación de PDF**: Función `generatePdfReport` que se activa automáticamente al crear diagnósticos.
- **Funciones de Email**: Sistema SMTP con reCAPTCHA v3 para formularios de contacto.

### ✅ Accesibilidad
- **Estándares WCAG 2.1 AA**: Implementación completa de navegación por teclado, soporte para lectores de pantalla, contraste optimizado.
- **Panel de Configuración**: Panel de accesibilidad que permite ajustar tema, tamaño de texto y navegación.

### ✅ Sistema de Recomendaciones
- **Plan de Acción Dinámico**: Sistema que conecta debilidades del usuario con cursos y artículos existentes.
- **Scoring Service**: Servicio que calcula puntajes y genera recomendaciones personalizadas.
- **Integración con Contenido**: Asociación de competencias con cursos y posts para recomendaciones inteligentes.

## 3. Backlog: Tareas y Funcionalidades Pendientes

### 🔴 Prioridad Crítica (Seguridad)

- [ ] **[Seguridad] Mover la llamada al API de Gemini a una Cloud Function** para ocultar la API Key del frontend.
- [ ] **[Seguridad] Implementar reglas de seguridad robustas en firestore.rules** para proteger completamente los datos de los usuarios.
- [ ] **[Seguridad] Implementar reglas de seguridad en storage.rules** para controlar la subida de archivos y requerir autenticación.
- [ ] **[Seguridad] Almacenar la API Key de Gemini como un "secret"** en Google Cloud Functions.

### 🟠 Prioridad Alta (Experiencia de Usuario)

- [ ] **[UX] Persistir el estado del formulario del diagnóstico en localStorage** para evitar la pérdida de datos al recargar la página.
- [ ] **[UX] Mejorar el manejo de errores y los estados de carga** durante la generación del reporte de IA.
- [ ] **[Backend] Implementar la Cloud Function para la generación de reportes en PDF** (parcialmente implementada, necesita refinamiento).
- [ ] **[IA] Refinar el prompt de la IA** para generar un plan de acción más dinámico y estructurado.
- [ ] **[UX] Implementar lazy loading en las rutas de Angular** para optimizar el tiempo de carga inicial.

### 🟡 Prioridad Media (Nuevas Funcionalidades)

- [ ] **[Feature] Desarrollar completamente la sección de Cursos**, vinculándolos a los resultados del diagnóstico.
- [ ] **[Feature] Completar el panel de administración** para la gestión de todo el contenido dinámico.
- [ ] **[Feature] Implementar sistema de notificaciones por email** para reportes generados.
- [ ] **[Feature] Desarrollar dashboard de seguimiento** para usuarios que han completado diagnósticos.
- [ ] **[Feature] Implementar sistema de métricas y analytics** para medir el uso de la plataforma.

### 🟢 Prioridad Baja (Optimizaciones)

- [ ] **[Performance] Implementar cache de resultados de IA** para diagnósticos similares.
- [ ] **[Performance] Optimizar consultas de Firestore** con índices más eficientes.
- [ ] **[UI] Mejorar la responsividad** en dispositivos móviles.
- [ ] **[Testing] Implementar tests unitarios y de integración** para componentes críticos.

## 4. Plan Estratégico por Fases

### 🚀 Fase 1: Cimentación y Seguridad (Inmediato - 2 semanas)

**Objetivo**: Establecer una base sólida y segura para el proyecto.

#### Tarea 1.1: Crear Cloud Function generateReportProxy
- **Descripción**: Crear una nueva Cloud Function que actúe como proxy para las llamadas a Gemini.
- **Responsable**: Desarrollador Backend
- **Estimación**: 3 días
- **Dependencias**: Ninguna

#### Tarea 1.2: Migrar lógica de generative-ai.service.ts a la nueva Cloud Function
- **Descripción**: Mover toda la lógica de generación de reportes al backend.
- **Responsable**: Desarrollador Backend
- **Estimación**: 2 días
- **Dependencias**: Tarea 1.1

#### Tarea 1.3: Almacenar la API Key de Gemini como un "secret" en Google Cloud
- **Descripción**: Configurar variables de entorno seguras en Cloud Functions.
- **Responsable**: DevOps/Backend
- **Estimación**: 1 día
- **Dependencias**: Tarea 1.1

#### Tarea 1.4: Reescribir firestore.rules para proteger la colección diagnostics
- **Descripción**: Implementar reglas de seguridad robustas para datos de usuarios.
- **Responsable**: Desarrollador Backend
- **Estimación**: 2 días
- **Dependencias**: Ninguna

#### Tarea 1.5: Reescribir storage.rules para requerir autenticación
- **Descripción**: Implementar control de acceso basado en autenticación.
- **Responsable**: Desarrollador Backend
- **Estimación**: 1 día
- **Dependencias**: Ninguna

### 🚀 Fase 2: Robustecimiento del Diagnóstico (Corto Plazo - 4 semanas)

**Objetivo**: Mejorar la experiencia del usuario y la calidad de los reportes.

#### Tarea 2.1: Implementar persistencia del estado del formulario
- **Descripción**: Guardar progreso del diagnóstico en localStorage.
- **Responsable**: Desarrollador Frontend
- **Estimación**: 3 días
- **Dependencias**: Ninguna

#### Tarea 2.2: Mejorar manejo de errores y estados de carga
- **Descripción**: Implementar estados de carga más informativos y manejo robusto de errores.
- **Responsable**: Desarrollador Frontend
- **Estimación**: 4 días
- **Dependencias**: Ninguna

#### Tarea 2.3: Refinar prompt de IA para plan de acción dinámico
- **Descripción**: Optimizar el prompt para generar planes más estructurados y accionables.
- **Responsable**: Desarrollador Backend + Especialista en IA
- **Estimación**: 5 días
- **Dependencias**: Tarea 1.2

#### Tarea 2.4: Implementar lazy loading en rutas de Angular
- **Descripción**: Optimizar el tiempo de carga inicial de la aplicación.
- **Responsable**: Desarrollador Frontend
- **Estimación**: 3 días
- **Dependencias**: Ninguna

### 🚀 Fase 3: Expansión de Funcionalidades (Mediano Plazo - 8 semanas)

**Objetivo**: Desarrollar nuevas funcionalidades que agreguen valor al usuario.

#### Tarea 3.1: Completar sección de Cursos
- **Descripción**: Desarrollar completamente la funcionalidad de cursos con integración al diagnóstico.
- **Responsable**: Desarrollador Full-Stack
- **Estimación**: 10 días
- **Dependencias**: Tarea 2.3

#### Tarea 3.2: Completar panel de administración
- **Descripción**: Finalizar todas las funcionalidades del panel de administración.
- **Responsable**: Desarrollador Full-Stack
- **Estimación**: 12 días
- **Dependencias**: Ninguna

#### Tarea 3.3: Implementar sistema de notificaciones por email
- **Descripción**: Sistema automático de envío de reportes por email.
- **Responsable**: Desarrollador Backend
- **Estimación**: 5 días
- **Dependencias**: Tarea 1.2

#### Tarea 3.4: Desarrollar dashboard de seguimiento
- **Descripción**: Dashboard para usuarios que han completado diagnósticos.
- **Responsable**: Desarrollador Frontend
- **Estimación**: 8 días
- **Dependencias**: Tarea 3.1

### 🚀 Fase 4: Mantenimiento y Optimización (Permanente)

**Objetivo**: Mantener la calidad del código y optimizar el rendimiento.

#### Tarea 4.1: Implementar tests unitarios y de integración
- **Descripción**: Cubrir con tests los componentes críticos de la aplicación.
- **Responsable**: Desarrollador Full-Stack
- **Estimación**: 15 días
- **Dependencias**: Ninguna

#### Tarea 4.2: Optimizar consultas de Firestore
- **Descripción**: Revisar y optimizar todas las consultas a la base de datos.
- **Responsable**: Desarrollador Backend
- **Estimación**: 8 días
- **Dependencias**: Ninguna

#### Tarea 4.3: Implementar sistema de métricas y analytics
- **Descripción**: Sistema para medir el uso y rendimiento de la plataforma.
- **Responsable**: Desarrollador Full-Stack
- **Estimación**: 10 días
- **Dependencias**: Ninguna

#### Tarea 4.4: Mejorar responsividad móvil
- **Descripción**: Optimizar la experiencia en dispositivos móviles.
- **Responsable**: Desarrollador Frontend
- **Estimación**: 6 días
- **Dependencias**: Ninguna

## 5. Registro de Avance (Changelog)

### 2024-12-19: Creado el documento PROJECT_ROADMAP.md
- **Descripción**: Documento inicial de planificación del proyecto SubeAcademia.cl
- **Tareas Completadas**: Análisis exhaustivo del código fuente y archivos README
- **Estado**: ✅ Documento creado y roadmap definido
- **Próximo Paso**: Iniciar implementación de Fase 1 (Cimentación y Seguridad)

---

**📊 Estado General del Proyecto**: 65% Completado  
**🎯 Próxima Fase**: Fase 1 - Cimentación y Seguridad  
**⏱️ Estimación Total**: 12-16 semanas para completar todas las fases  
**👥 Equipo Requerido**: 2-3 desarrolladores (Frontend, Backend, DevOps)  

---

*Este documento se actualiza automáticamente cada vez que se completan tareas del backlog. Para actualizar el roadmap, marcar la tarea como completada en la sección 3 y añadir una nueva entrada en la sección 5.*
