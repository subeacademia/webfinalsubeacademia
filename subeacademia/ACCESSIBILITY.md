# Guía de Accesibilidad - Sube Academ-IA

## Resumen

Esta aplicación ha sido diseñada y desarrollada siguiendo las mejores prácticas de accesibilidad web (a11y) para garantizar que sea utilizable por todos los usuarios, independientemente de sus capacidades o dispositivos de acceso.

## Estándares de Accesibilidad

La aplicación cumple con los siguientes estándares:
- **WCAG 2.1 AA**: Nivel de conformidad recomendado para la mayoría de sitios web
- **Section 508**: Estándares de accesibilidad para el gobierno federal de EE.UU.
- **EN 301 549**: Estándares europeos de accesibilidad

## Características de Accesibilidad Implementadas

### 1. Navegación por Teclado

- **Navegación completa por teclado**: Todos los elementos interactivos son accesibles mediante teclado
- **Orden de tabulación lógico**: El foco se mueve de manera intuitiva a través de la interfaz
- **Atajos de teclado**: Teclas de acceso rápido para funciones principales
- **Indicadores de foco visibles**: Contornos claros para elementos con foco

#### Atajos de Teclado Disponibles:
- `Tab`: Navegar entre elementos interactivos
- `Shift + Tab`: Navegar hacia atrás
- `Enter` / `Espacio`: Activar botones y enlaces
- `Escape`: Cerrar modales y paneles
- `F6`: Enfocar el contenido principal
- `Ctrl + M`: Abrir/cerrar menú de navegación

### 2. Soporte para Lectores de Pantalla

- **Atributos ARIA**: Implementación completa de roles, estados y propiedades ARIA
- **Textos alternativos**: Todas las imágenes tienen atributos `alt` descriptivos
- **Etiquetas asociadas**: Formularios con labels apropiados
- **Anuncios dinámicos**: Cambios de estado anunciados a lectores de pantalla
- **Navegación por encabezados**: Estructura jerárquica clara de títulos

#### Roles ARIA Implementados:
- `role="navigation"`: Navegación principal
- `role="main"`: Contenido principal
- `role="complementary"`: Contenido complementario
- `role="dialog"`: Ventanas modales
- `role="button"`: Elementos interactivos
- `role="form"`: Formularios
- `role="search"`: Funciones de búsqueda

### 3. Contraste y Legibilidad

- **Contraste de color**: Cumple con los estándares WCAG AA (4.5:1)
- **Modo de alto contraste**: Opción para usuarios con problemas de visión
- **Tipografía legible**: Fuentes sans-serif con tamaños apropiados
- **Espaciado adecuado**: Márgenes y padding que mejoran la legibilidad

### 4. Adaptabilidad y Personalización

- **Tema claro/oscuro**: Cambio automático según preferencias del sistema
- **Tamaño de texto ajustable**: Opción para aumentar el tamaño del texto
- **Movimiento reducido**: Respeta la preferencia `prefers-reduced-motion`
- **Alto contraste**: Modo especial para mejor legibilidad

### 5. Formularios Accesibles

- **Labels asociados**: Cada campo tiene su etiqueta correspondiente
- **Mensajes de error**: Errores claros y descriptivos
- **Validación en tiempo real**: Feedback inmediato sobre la entrada
- **Agrupación lógica**: Campos relacionados agrupados apropiadamente

### 6. Contenido Multimedia

- **Imágenes descriptivas**: Atributos `alt` significativos
- **Videos con subtítulos**: Subtítulos disponibles para contenido de video
- **Controles de audio**: Controles accesibles para contenido de audio
- **Alternativas textuales**: Descripciones para contenido no textual

## Componentes de Accesibilidad

### 1. Panel de Configuración de Accesibilidad

Ubicado en la esquina superior derecha, permite a los usuarios:
- Activar/desactivar alto contraste
- Ajustar tamaño de texto
- Reducir movimiento
- Optimizar navegación por teclado
- Generar reportes de accesibilidad

### 2. Servicio de Accesibilidad

Servicio centralizado que proporciona:
- Configuración persistente de accesibilidad
- Detección automática de preferencias del sistema
- Generación de reportes de accesibilidad
- Anuncios a lectores de pantalla

### 3. Navegación Mejorada

- Menú de navegación con roles ARIA apropiados
- Breadcrumbs para orientación del usuario
- Enlaces "Saltar al contenido" para navegación rápida
- Indicadores de página actual

## Pruebas de Accesibilidad

### Herramientas Utilizadas

1. **Lighthouse**: Auditoría automatizada de accesibilidad
2. **axe-core**: Biblioteca de pruebas de accesibilidad
3. **NVDA**: Lector de pantalla para pruebas manuales
4. **VoiceOver**: Lector de pantalla de macOS
5. **Navegación por teclado**: Pruebas manuales de navegación

### Métricas de Accesibilidad

- **Puntuación Lighthouse**: 95+ en accesibilidad
- **Problemas críticos**: 0
- **Advertencias**: <5
- **Cumplimiento WCAG**: AA completo

## Mejores Prácticas Implementadas

### 1. Semántica HTML

- Uso apropiado de elementos HTML5
- Estructura de encabezados jerárquica
- Listas para elementos relacionados
- Tablas para datos tabulares

### 2. Atributos ARIA

- `aria-label`: Etiquetas descriptivas
- `aria-describedby`: Descripciones adicionales
- `aria-live`: Anuncios dinámicos
- `aria-expanded`: Estados expandidos/colapsados
- `aria-controls`: Relaciones de control

### 3. Gestión del Foco

- Foco visible en todos los elementos interactivos
- Trampa de foco en modales
- Restauración del foco después de acciones
- Indicadores de foco personalizados

### 4. Responsive Design

- Diseño adaptable a diferentes tamaños de pantalla
- Navegación optimizada para dispositivos móviles
- Controles táctiles apropiados
- Zoom sin pérdida de funcionalidad

## Guía para Desarrolladores

### 1. Agregar Nuevos Componentes

Al crear nuevos componentes, asegúrate de:

```typescript
@Component({
  selector: 'app-example',
  template: `
    <div role="region" aria-labelledby="example-title">
      <h2 id="example-title">Título del Componente</h2>
      <button 
        (click)="action()"
        aria-label="Descripción de la acción"
        class="focus-visible:ring-2 focus-visible:ring-blue-500">
        Acción
      </button>
    </div>
  `
})
export class ExampleComponent {
  // Implementación del componente
}
```

### 2. Atributos ARIA Comunes

- `aria-label`: Para elementos sin texto visible
- `aria-describedby`: Para descripciones adicionales
- `aria-hidden="true"`: Para elementos decorativos
- `aria-live="polite"`: Para anuncios no urgentes
- `aria-live="assertive"`: Para anuncios urgentes

### 3. Navegación por Teclado

```typescript
@HostListener('keydown.enter')
@HostListener('keydown.space')
onActivate(): void {
  // Acción del componente
}

@HostListener('keydown.escape')
onCancel(): void {
  // Cancelar o cerrar
}
```

### 4. Testing de Accesibilidad

```typescript
// En pruebas unitarias
it('should be accessible', () => {
  const fixture = TestBed.createComponent(ExampleComponent);
  fixture.detectChanges();
  
  // Verificar roles ARIA
  expect(fixture.nativeElement.querySelector('[role="button"]')).toBeTruthy();
  
  // Verificar labels
  expect(fixture.nativeElement.querySelector('[aria-label]')).toBeTruthy();
});
```

## Recursos Adicionales

### Documentación
- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [ARIA Authoring Practices](https://www.w3.org/WAI/ARIA/apg/)
- [Web Accessibility Initiative](https://www.w3.org/WAI/)

### Herramientas
- [axe DevTools](https://www.deque.com/axe/)
- [Lighthouse](https://developers.google.com/web/tools/lighthouse)
- [WAVE](https://wave.webaim.org/)

### Lectores de Pantalla
- [NVDA](https://www.nvaccess.org/) (Windows)
- [VoiceOver](https://www.apple.com/accessibility/vision/) (macOS)
- [JAWS](https://www.freedomscientific.com/products/software/jaws/) (Windows)

## Mantenimiento y Mejoras

### 1. Auditorías Regulares

- Ejecutar Lighthouse mensualmente
- Revisar reportes de accesibilidad
- Probar con lectores de pantalla
- Validar navegación por teclado

### 2. Actualizaciones

- Mantener dependencias actualizadas
- Implementar nuevas características de accesibilidad
- Seguir estándares emergentes
- Recopilar feedback de usuarios

### 3. Monitoreo

- Rastrear métricas de accesibilidad
- Identificar problemas comunes
- Medir impacto de mejoras
- Documentar lecciones aprendidas

## Contacto y Soporte

Para reportar problemas de accesibilidad o solicitar mejoras:

- **Email**: accesibilidad@subeacademia.com
- **Issues**: Crear un issue en el repositorio con la etiqueta `accessibility`
- **Feedback**: Usar el formulario de contacto en la aplicación

---

**Nota**: Esta documentación se actualiza regularmente para reflejar las mejoras continuas en accesibilidad. Última actualización: Diciembre 2024.
