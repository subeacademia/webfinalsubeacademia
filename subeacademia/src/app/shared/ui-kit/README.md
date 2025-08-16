# UI Kit - Mini Design System

Este directorio contiene componentes de UI base reutilizables para mantener la coherencia visual en toda la aplicación.

## Componentes Disponibles

### 1. UiButtonComponent (`app-ui-button`)

Un botón genérico con múltiples variantes y tamaños.

#### Props:
- `variant`: 'primary' | 'secondary' | 'ghost' (default: 'primary')
- `size`: 'sm' | 'md' | 'lg' (default: 'md')
- `disabled`: boolean (default: false)
- `type`: 'button' | 'submit' | 'reset' (default: 'button')

#### Eventos:
- `(clicked)`: Se emite cuando se hace clic en el botón

#### Uso:
```html
<app-ui-button variant="primary" size="lg" (clicked)="onAction()">
  Texto del Botón
</app-ui-button>
```

### 2. UiModalComponent (`app-ui-modal`)

Un modal genérico con slots para contenido personalizado.

#### Props:
- `isOpen`: boolean - Controla la visibilidad del modal
- `size`: 'sm' | 'md' | 'lg' | 'xl' (default: 'md')

#### Eventos:
- `(close)`: Se emite cuando se cierra el modal

#### Slots:
- `[slot='header']`: Contenido del encabezado del modal
- `[slot='body']`: Contenido principal del modal

#### Uso:
```html
<app-ui-modal [isOpen]="isModalOpen" (close)="onClose()" size="lg">
  <h2 slot="header">Título del Modal</h2>
  <div slot="body">
    Contenido del modal aquí
  </div>
</app-ui-modal>
```

### 3. UiCardComponent (`app-ui-card`)

Una tarjeta genérica con slots para diferentes tipos de contenido.

#### Props:
- `size`: 'small' | 'medium' | 'large' (default: 'medium')

#### Slots:
- `[slot='image']`: Imagen de la tarjeta
- `[slot='title']`: Título de la tarjeta
- `[slot='description']`: Descripción de la tarjeta
- `[slot='tags']`: Etiquetas o badges
- `[slot='footer']`: Contenido del pie de la tarjeta

#### Uso:
```html
<app-ui-card size="medium">
  <img slot="image" src="image.jpg" alt="Descripción">
  <h3 slot="title">Título de la Tarjeta</h3>
  <p slot="description">Descripción de la tarjeta</p>
  <div slot="tags">
    <span class="badge">Tag 1</span>
    <span class="badge">Tag 2</span>
  </div>
  <div slot="footer">
    <button>Acción</button>
  </div>
</app-ui-card>
```

## Clases CSS de Tailwind

Los componentes utilizan Tailwind CSS para el diseño. Las clases se aplican dinámicamente según las props:

### Botones:
- **Primary**: `bg-blue-600 text-white hover:bg-blue-700`
- **Secondary**: `bg-gray-200 text-gray-800 hover:bg-gray-300`
- **Ghost**: `bg-transparent text-gray-700 hover:bg-gray-100 border border-gray-300`

### Tamaños:
- **Small**: `px-3 py-1.5 text-sm`
- **Medium**: `px-4 py-2 text-base`
- **Large**: `px-6 py-3 text-lg`

## Migración de Componentes Existentes

Para migrar componentes existentes a este UI Kit:

1. Reemplazar `<button>` por `<app-ui-button>`
2. Cambiar `(click)` por `(clicked)`
3. Usar `<app-ui-modal>` en lugar de modales personalizados
4. Migrar tarjetas existentes a `<app-ui-card>`

## Beneficios

- **Consistencia**: Todos los componentes siguen el mismo patrón de diseño
- **Mantenibilidad**: Cambios en un lugar se reflejan en toda la aplicación
- **Reutilización**: Componentes genéricos que se adaptan a diferentes contextos
- **Accesibilidad**: Estructura semántica consistente
- **Performance**: Componentes standalone optimizados
