# Configuración de Proxy para Desarrollo Local

## Problema Resuelto
Este proyecto ahora incluye una configuración de proxy para resolver problemas de CORS durante el desarrollo local. Cuando la aplicación Angular (localhost:4200) intenta comunicarse con la API de Vercel (https://apisube-smoky.vercel.app), el navegador bloquea la petición debido a políticas de CORS.

## Solución Implementada

### 1. Archivo de Configuración del Proxy
**Archivo:** `proxy.conf.json`
```json
{
  "/api": {
    "target": "https://apisube-smoky.vercel.app",
    "secure": false,
    "changeOrigin": true,
    "logLevel": "debug"
  }
}
```

### 2. Configuración de Angular
**Archivo:** `angular.json`
- Se añadió `"proxyConfig": "proxy.conf.json"` en la sección `serve -> options`

### 3. URL de la API en Desarrollo
**Archivo:** `src/environments/environment.ts`
- Cambiado de `http://localhost:3000/api/azure/generate` a `/api/azure/generate`

## Cómo Funciona

1. **En Desarrollo:** La aplicación hace peticiones a `/api/azure/generate`
2. **El Proxy Intercepta:** Angular detecta que la URL comienza con `/api`
3. **Redirección Transparente:** El proxy redirige la petición a `https://apisube-smoky.vercel.app/api/azure/generate`
4. **Sin CORS:** El navegador ve la petición como proveniente del mismo origen

## Uso

### Iniciar el Servidor de Desarrollo
```bash
ng serve
```

### Verificar que Funciona
1. Abre las herramientas de desarrollador del navegador (F12)
2. Ve a la pestaña "Network"
3. Realiza una acción que active una llamada a la API
4. Deberías ver peticiones a `/api/azure/generate` que se resuelven correctamente

### Logs de Debug
Con `"logLevel": "debug"` habilitado, verás en la consola del terminal donde ejecutas `ng serve`:
- Peticiones interceptadas por el proxy
- Redirecciones realizadas
- Errores de conexión (si los hay)

## Archivos Modificados

1. `proxy.conf.json` - **NUEVO** - Configuración del proxy
2. `angular.json` - Añadida configuración `proxyConfig`
3. `src/environments/environment.ts` - Cambiada URL a ruta relativa

## Notas Importantes

- **Solo para Desarrollo:** Esta configuración solo funciona con `ng serve`
- **Producción:** En producción, las peticiones van directamente a la URL completa
- **HTTPS:** `"secure": false` permite conexiones HTTPS desde HTTP local
- **Change Origin:** `"changeOrigin": true` modifica el header `Host` para evitar problemas de servidor

## Troubleshooting

### Si el proxy no funciona:
1. Verifica que `proxy.conf.json` esté en el directorio raíz del proyecto
2. Asegúrate de que `angular.json` tenga la configuración correcta
3. Reinicia el servidor de desarrollo (`ng serve`)
4. Revisa los logs en la consola del terminal

### Si sigues viendo errores de CORS:
1. Verifica que la URL en `environment.ts` sea `/api/azure/generate`
2. Confirma que la API de Vercel esté funcionando
3. Revisa la configuración de CORS en el servidor de Vercel
