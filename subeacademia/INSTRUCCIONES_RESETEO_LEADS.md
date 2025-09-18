# Instrucciones para Resetear Leads Antiguos

## ✅ Sistema de Leads Mejorado Implementado

Se ha implementado un sistema completo de gestión de leads que incluye:

### 🎯 Funcionalidades Principales

1. **CRUD Completo de Leads**
   - ✅ **Ver**: Visualización detallada de toda la información del diagnóstico
   - ✅ **Editar**: Modificar datos del lead, estado, y agregar notas
   - ✅ **Eliminar**: Borrar leads individuales con confirmación
   - ✅ **Crear**: Se crean automáticamente cuando un cliente completa el diagnóstico

2. **Información Completa del Diagnóstico**
   - ✅ **Respuestas ARES**: Todas las respuestas del cliente con puntuaciones
   - ✅ **Competencias**: Evaluación de competencias en IA
   - ✅ **Contexto Profesional**: Industria, cargo, tamaño de empresa
   - ✅ **Resumen Ejecutivo**: Análisis generado por IA
   - ✅ **Plan de Acción**: Recomendaciones personalizadas
   - ✅ **Fortalezas y Oportunidades**: Identificadas por el diagnóstico

3. **Información Comercial Inteligente**
   - ✅ **Nivel de Madurez**: Automático basado en respuestas
   - ✅ **Sugerencias Comerciales**: Productos/servicios recomendados
   - ✅ **Puntuación General**: Score de 0-5 en madurez de IA
   - ✅ **Filtros por Tipo**: Personas naturales vs empresas

### 🧹 Reseteo de Leads Antiguos

#### Opción 1: Botón en la Interfaz (Recomendado)
1. Ve a **Admin → Leads** en el panel administrativo
2. En la parte superior derecha, encontrarás el botón **"Limpiar Leads Antiguos"**
3. Haz clic en el botón (aparecerá un ícono de papelera)
4. Confirma la acción cuando aparezca el diálogo de confirmación
5. El sistema eliminará automáticamente todos los leads de la colección antigua `leads`
6. Los nuevos leads del diagnóstico actualizado aparecerán en la colección `diagnostic-leads`

#### Opción 2: Script Manual (Avanzado)
Si prefieres usar el script de Node.js:

```bash
cd subeacademia/scripts
node reset-old-leads.js
```

**Nota**: Necesitarás configurar las credenciales de Firebase en el script.

### 📊 Visualización de Datos del Cliente

Ahora puedes ver **toda la información** que responde el cliente:

#### En la Lista Principal:
- Tipo de lead (Persona/Empresa)
- Nombre y datos de contacto
- Estado del lead (Nuevo, Contactado, Interesado, etc.)
- Fecha de creación

#### En el Modal de Detalles:
1. **Datos Personales/Empresariales**
   - Información de contacto completa
   - Datos de la empresa (si aplica)
   - Preferencias de comunicación

2. **Contexto Profesional**
   - Rol/cargo
   - Industria
   - Área de trabajo
   - Tamaño del equipo

3. **Evaluación ARES (Madurez en IA)**
   - Todas las respuestas del cliente (1-5)
   - Puntuación general calculada
   - Nivel de madurez (Principiante a Avanzado)
   - Progreso de completitud

4. **Competencias en IA**
   - Evaluación detallada por competencia
   - Puntuaciones individuales
   - Nivel general de competencia

5. **Análisis e Insights**
   - Resumen ejecutivo generado por IA
   - Plan de acción personalizado
   - Fortalezas identificadas
   - Oportunidades de mejora

6. **Información Comercial**
   - Sugerencias de productos/servicios
   - Nivel de oportunidad comercial
   - Recomendaciones específicas por industria

### 🎯 Gestión de Estados

Cada lead puede tener los siguientes estados:
- **Nuevo**: Recién creado
- **Contactado**: Ya se ha establecido contacto
- **Interesado**: Muestra interés en los servicios
- **No Interesado**: No está interesado actualmente
- **Convertido**: Se ha convertido en cliente

### 📝 Notas del Administrador

- Cada lead puede tener notas personalizadas
- Se pueden agregar observaciones comerciales
- Historial de interacciones
- Seguimiento personalizado

### 🔍 Filtros y Búsqueda

- **Por Tipo**: Filtrar entre personas naturales y empresas
- **Búsqueda**: Por nombre o email
- **Paginación**: Para manejar grandes volúmenes de leads

### ✨ Beneficios del Nuevo Sistema

1. **Información Completa**: Ya no se pierde ninguna respuesta del cliente
2. **Insights Comerciales**: Sugerencias automáticas basadas en el diagnóstico
3. **Gestión Eficiente**: CRUD completo con interfaz intuitiva
4. **Seguimiento**: Estados y notas para el proceso comercial
5. **Limpieza**: Fácil reseteo de datos antiguos

### 🚀 Próximos Pasos Recomendados

1. **Resetear leads antiguos** usando el botón en la interfaz
2. **Probar el diagnóstico** para generar nuevos leads
3. **Explorar la información detallada** de cada lead
4. **Configurar estados y notas** según tu proceso comercial
5. **Usar las sugerencias comerciales** para personalizar ofertas

---

**Nota Importante**: Los leads antiguos del diagnóstico anterior no contenían toda esta información rica. Una vez que resetees y los clientes empiecen a usar el nuevo diagnóstico, tendrás acceso a toda esta información valiosa para tu proceso comercial.
