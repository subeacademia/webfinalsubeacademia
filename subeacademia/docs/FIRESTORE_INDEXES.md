## Índices requeridos para Firestore (FirebaseDataService)

Sigue estos pasos para crearlos en tu proyecto de Firebase:

1) Abre la consola de Firebase → Firestore Database → Índices → pestaña "Compuestos" → botón "Crear índice".
2) Para cada colección indicada abajo, agrega los campos en el orden exacto (tipo Ascendente/Descendente o Array-contains según corresponda).
3) Publica y espera a que Firebase termine de construir el índice (puede tardar algunos minutos).

### Colección `posts`
- status Ascendente, publishedAt Descendente
- status Ascendente, lang Ascendente, publishedAt Descendente
- status Ascendente, tags Array-contains, publishedAt Descendente

### Colección `courses`
- status Ascendente, publishedAt Descendente
- status Ascendente, level Ascendente, publishedAt Descendente
- status Ascendente, topics Array-contains, publishedAt Descendente

Nota:
- Si agregas filtros adicionales (por ejemplo tags o topics con búsqueda), crea el índice combinando el campo de filtro (Array-contains) con el `orderBy('publishedAt','desc')` usado por la app.
- Si al ejecutar la app aparece un error de "failed-precondition" con un enlace para crear el índice, puedes seguir ese enlace directo desde la consola del navegador.

