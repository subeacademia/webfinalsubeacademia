# 🧪 INSTRUCCIONES ESPECÍFICAS: Test de Carga de Fotos

## 📋 **Preparación para el Test**

### **Paso 1: Limpiar Cache y Preparar**
1. **Abre el navegador** en modo incógnito (Ctrl+Shift+N)
2. **Ve al admin**: `localhost:4200/admin/collaborators`
3. **Abre DevTools**: F12 → Console
4. **Limpia la consola**: Clic en 🚫 (clear console)

### **Paso 2: Verificar Carga Inicial**
Deberías ver estos logs al cargar la página:
```
🚀 Inicializando componente de colaboradores...
🔄 Cargando colaboradores desde Firestore...
📊 Colaboradores obtenidos desde Firestore: 8
📊 Colaboradores cargados: 8
👥 Fundadores encontrados: 4
🤝 Colaboradores encontrados: 4
✅ Componente inicializado correctamente
```

## 🎯 **Test Específico: Subir Foto de Rodrigo Carrillo**

### **Paso 3: Abrir Modal de Edición**
1. **Haz clic en "Editar"** en la fila de Rodrigo Carrillo (primera fila)
2. **Verifica en la consola**:
   ```
   📝 Editando colaborador: {
     name: "Rodrigo Carrillo",
     imageUrl: "https://placehold.co/500x500/1e293b/ffffff?text=RC",
     logoUrl: "https://placehold.co/500x500/1e293b/ffffff?text=RC",
     isFounder: true
   }
   ```

### **Paso 4: Subir Imagen**
1. **En el modal**, busca "Foto Personal"
2. **Haz clic en "Choose File"** o "Seleccionar archivo"
3. **Selecciona una imagen** (JPG, PNG, WebP - máx 5MB)
4. **Espera a que suba** - deberías ver:
   ```
   ✅ Imagen subida exitosamente: https://firebasestorage.googleapis.com/v0/b/...
   📸 Imagen principal actualizada: https://firebasestorage.googleapis.com/...
   ```
5. **Verifica el preview** en el modal - debe aparecer la imagen

### **Paso 5: Guardar Cambios**
1. **Haz clic en "Guardar"**
2. **Observa TODOS estos logs en secuencia**:
   ```
   📸 Fundador - Guardando imageUrl: https://firebasestorage.googleapis.com/...
   🔄 Fundador - Usando imageUrl como logoUrl fallback
   💾 Datos completos a guardar: {
     name: "Rodrigo Carrillo",
     imageUrl: "https://firebasestorage.googleapis.com/...",
     logoUrl: "https://firebasestorage.googleapis.com/...",
     isFounder: true,
     ...
   }
   🔄 Actualizando fundador: Rodrigo Carrillo
   🖼️ Actualizando imageUrl: https://firebasestorage.googleapis.com/...
   🔄 Actualizando fundador con datos limpios: {...}
   ✅ Fundador actualizado en Firestore
   ⏳ Esperando a que Firestore procese la actualización...
   🔄 Recargando datos de la tabla...
   🔄 Cargando colaboradores desde Firestore...
   📊 Colaboradores obtenidos desde Firestore: 8
   📊 Colaboradores cargados: 8
   🖼️ Fundador Rodrigo Carrillo tiene foto real: https://firebasestorage.googleapis.com/...
   🔄 Change detection forzado
   🚪 Cerrando modal...
   🎉 Proceso de guardado completado exitosamente
   ```

### **Paso 6: Verificar Visualización**
1. **En la tabla del admin**: La foto de Rodrigo debe haber cambiado de "RC" a la imagen real
2. **Si no se ve**: Refresca la página (F5) y verifica de nuevo

### **Paso 7: Verificar en Sección "Nosotros"**
1. **Ve a**: `localhost:4200/es/nosotros`
2. **Busca la sección "Equipo Fundador"**
3. **Verifica que la foto de Rodrigo** sea la que subiste

## 🔍 **Logs Críticos a Verificar**

### **✅ Logs de Éxito Esperados:**
```
✅ Imagen subida exitosamente: https://firebasestorage.googleapis.com/...
📸 Fundador - Guardando imageUrl: https://firebasestorage.googleapis.com/...
🖼️ Actualizando imageUrl: https://firebasestorage.googleapis.com/...
✅ Fundador actualizado en Firestore
🖼️ Fundador Rodrigo Carrillo tiene foto real: https://firebasestorage.googleapis.com/...
```

### **❌ Logs de Error a Buscar:**
```
❌ Error subiendo imagen: ...
❌ Error actualizando fundador: ...
❌ Error cargando colaboradores: ...
```

## 🚨 **Troubleshooting por Logs**

### **Si ves: "❌ Error subiendo imagen"**
**Problema**: Firebase Storage  
**Solución**: Verificar configuración de Firebase Storage

### **Si ves: "❌ Error actualizando fundador"**
**Problema**: Firestore o reglas  
**Solución**: Verificar reglas de Firestore para colección `collaborators`

### **Si NO ves: "🖼️ Fundador Rodrigo Carrillo tiene foto real"**
**Problema**: La imagen no se guardó en Firestore  
**Solución**: Verificar que los datos se guardaron correctamente

### **Si ves todos los logs de éxito pero no se visualiza**
**Problema**: Change detection o cache del navegador  
**Solución**: 
1. Refresca la página (F5)
2. Limpia cache del navegador
3. Prueba en modo incógnito

## 🎯 **Resultado Esperado Final**

### **En Admin:**
- ✅ **Foto real** en lugar de placeholder "RC"
- ✅ **Logs de éxito** en consola
- ✅ **Sin errores** en consola

### **En "Nosotros":**
- ✅ **Misma foto** que subiste en admin
- ✅ **En sección "Equipo Fundador"**
- ✅ **Sincronizada automáticamente**

---

## 📞 **Si Sigue Sin Funcionar**

**Por favor, copia y pega TODOS los logs de la consola** desde que:
1. Abres el modal de edición
2. Subes la imagen
3. Guardas los cambios
4. Se recarga la tabla

**Esto me permitirá identificar exactamente dónde está fallando el proceso.**

---

**✅ INSTRUCCIONES COMPLETAS**  
*Sigue estos pasos exactamente y comparte los logs para diagnosticar cualquier problema restante.*
