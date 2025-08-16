# Mejoras en la Sección de Cursos

## Resumen de Cambios

Se han implementado las siguientes mejoras en la funcionalidad de cursos:

### 1. Nuevos Campos en el Modelo de Cursos

- **`price`**: Campo numérico para el precio del curso en euros
- **`paymentLink`**: Campo opcional para el enlace de pago del curso

### 2. Formulario de Edición Mejorado

En el componente `course-edit.component.ts` se han añadido:
- Campo de precio con validación numérica
- Campo de enlace de pago con validación de URL
- Los campos se guardan automáticamente al crear/editar cursos

### 3. Carga Masiva de Cursos

En el componente `admin-courses.component.ts` se ha implementado:
- Botón "Cargar Cursos desde JSON" en la interfaz de administración
- Modal para seleccionar archivo JSON
- Validación del formato del archivo
- Procesamiento en lote con barra de progreso
- Manejo de errores y reportes de éxito/fallo
- Soporte para crear nuevos cursos o actualizar existentes

### 4. Botones de Compra/Acceso

En la vista pública de cursos (`course.component.html`):
- Si el curso tiene precio > 0 y enlace de pago: muestra botón "Comprar Curso por €X"
- Si el curso es gratuito (precio = 0): muestra botón "Acceder Gratis"
- El botón de compra redirige al enlace de pago en nueva pestaña

## Uso de la Carga Masiva

### Formato del Archivo JSON

El archivo debe contener un array de objetos que cumplan con la interfaz `Course`. Ejemplo:

```json
[
  {
    "id": "curso-1",
    "slug": "introduccion-ia",
    "title": "Introducción a la IA",
    "description": "Descripción del curso",
    "price": 49.99,
    "paymentLink": "https://ejemplo.com/pago",
    "status": "published"
  }
]
```

### Campos Obligatorios

- `title`: Título del curso
- `slug`: Identificador único en la URL

### Campos Opcionales

- `id`: Si se proporciona, actualiza el curso existente; si no, crea uno nuevo
- `price`: Precio en euros (0 para cursos gratuitos)
- `paymentLink`: URL del enlace de pago
- `status`: Estado del curso (draft, published, scheduled)
- Y todos los demás campos del modelo `Course`

### Pasos para Usar la Carga Masiva

1. Preparar archivo JSON con el formato correcto
2. Ir a Admin > Courses
3. Hacer clic en "Cargar Cursos desde JSON"
4. Seleccionar el archivo JSON
5. Hacer clic en "Procesar"
6. Esperar a que se complete el procesamiento
7. Revisar el reporte de resultados

## Consideraciones de Seguridad

- Solo usuarios con permisos de administrador pueden acceder a esta funcionalidad
- Los archivos JSON se procesan localmente, no se suben al servidor
- Se valida que el contenido sea un array válido antes de procesarlo
- Cada curso se valida individualmente antes de ser creado/actualizado

## Compatibilidad

- Los nuevos campos son opcionales, por lo que los cursos existentes seguirán funcionando
- El sistema mantiene compatibilidad hacia atrás
- Los campos `price` y `paymentLink` se pueden dejar vacíos para cursos gratuitos

## Archivos Modificados

- `src/app/core/models/course.model.ts` - Añadido campo `paymentLink`
- `src/app/admin/courses/course-edit.component.ts` - Campos de precio y pago
- `src/app/admin/courses/admin-courses.component.ts` - Carga masiva y campos adicionales
- `src/app/features/courses/course.component.ts` - Método `goToPayment`
- `src/app/features/courses/course.component.html` - Botones de compra/acceso
- `cursos-ejemplo.json` - Archivo de ejemplo para la carga masiva
- `docs/CURSOS_MEJORAS.md` - Esta documentación
