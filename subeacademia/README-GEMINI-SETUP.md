# Configuración de Google Gemini API para Sube Academia

## 🚀 Refactorización Completada

El servicio de IA ha sido refactorizado exitosamente para usar la API de Google Gemini en lugar de Azure. Los cambios principales incluyen:

### ✅ Cambios Implementados

1. **Archivos de Entorno Actualizados**
   - `src/environments/environment.ts` - Añadida propiedad `geminiApiKey`
   - `src/environments/environment.prod.ts` - Añadida propiedad `geminiApiKey`

2. **Servicio de IA Refactorizado**
   - `src/app/core/ai/generative-ai.service.ts` - Completamente refactorizado
   - Eliminada dependencia de Azure
   - Implementada llamada directa a Gemini usando `fetch`
   - Mantenida compatibilidad con interfaces existentes

3. **Componente de Resultados**
   - El componente `diagnostic-results.component.ts` ya está preparado para renderizar el nuevo formato JSON
   - No se requieren cambios adicionales en el HTML

## 🔑 Configuración de la API Key

### 1. Obtener API Key de Gemini

1. Ve a [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Inicia sesión con tu cuenta de Google
3. Haz clic en "Create API Key"
4. Copia la API Key generada

### 2. Configurar en Desarrollo Local

1. Abre `src/environments/environment.ts`
2. Reemplaza `'TU_API_KEY_AQUI'` con tu API Key real:

```typescript
// API Key de Google Gemini
geminiApiKey: 'AIzaSyC...', // Tu API Key real aquí
```

### 3. Configurar en Producción

**⚠️ IMPORTANTE: NUNCA subas tu API Key real al repositorio**

Para producción, configura la API Key como variable de entorno:

#### Opción A: Variables de Entorno del Sistema
```bash
export GEMINI_API_KEY="tu_api_key_aqui"
```

#### Opción B: Archivo .env (recomendado)
1. Crea un archivo `.env` en la raíz del proyecto:
```bash
GEMINI_API_KEY=tu_api_key_aqui
```

2. Asegúrate de que `.env` esté en `.gitignore`

#### Opción C: Pipeline de CI/CD
Configura la variable `GEMINI_API_KEY` en tu pipeline de CI/CD (GitHub Actions, GitLab CI, etc.)

## 🧪 Pruebas

### 1. Verificar Configuración
```bash
# Verificar que la API Key esté configurada
ng serve
# Abrir la consola del navegador y verificar que no hay errores de API Key
```

### 2. Probar Diagnóstico
1. Navega a la página de diagnóstico
2. Completa el formulario
3. Verifica que se genere el análisis usando Gemini
4. Revisa la consola para confirmar las llamadas a la API

## 🔧 Troubleshooting

### Error: "Invalid API Key"
- Verifica que la API Key esté correctamente configurada
- Asegúrate de que no haya espacios extra o caracteres inválidos
- Confirma que la API Key tenga permisos para Gemini

### Error: "Quota Exceeded"
- Verifica tu cuota en [Google AI Studio](https://makersuite.google.com/app/apikey)
- Considera actualizar tu plan si es necesario

### Error: "Model Not Found"
- Verifica que estés usando el modelo correcto: `gemini-2.5-flash`
- Confirma que tu API Key tenga acceso a este modelo

## 📊 Monitoreo

### Logs de la Consola
El servicio registra todas las llamadas a la API en la consola del navegador:
- Éxito: Respuesta JSON del análisis
- Error: Detalles del error de la API

### Métricas de Uso
Monitorea tu uso en [Google AI Studio](https://makersuite.google.com/app/apikey)

## 🚨 Seguridad

### ✅ Buenas Prácticas
- Nunca subas API Keys al repositorio
- Usa variables de entorno en producción
- Rota las API Keys regularmente
- Monitorea el uso para detectar uso no autorizado

### ❌ Evitar
- Hardcodear API Keys en el código
- Compartir API Keys en chats o emails
- Usar la misma API Key en múltiples proyectos
- Ignorar alertas de cuota excedida

## 🔄 Rollback

Si necesitas volver a Azure temporalmente:

1. Revertir los cambios en `generative-ai.service.ts`
2. Restaurar la dependencia de `AsistenteIaService`
3. Comentar la propiedad `geminiApiKey` en los archivos de entorno

## 📞 Soporte

Para problemas con:
- **Configuración de Gemini**: [Google AI Studio Support](https://support.google.com/ai-studio)
- **Implementación**: Revisar logs de la consola del navegador
- **Errores de API**: Verificar [Google AI Status](https://status.ai.google.com/)

---

**🎯 Estado**: ✅ Refactorización Completada  
**🔑 Próximo Paso**: Configurar tu API Key de Gemini  
**📅 Fecha**: $(date)
