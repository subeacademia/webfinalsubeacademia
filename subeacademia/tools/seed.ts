import { initializeApp, applicationDefault } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

async function main() {
  initializeApp({ credential: applicationDefault() });
  const db = getFirestore();

  const now = Date.now();
  const langs: Array<'es' | 'en' | 'pt'> = ['es', 'en', 'pt'];

  // Seed mínimo solicitado: crear un post publicado en español
  await db.collection('posts').add({
    lang: 'es',
    title: 'Primer post',
    slug: 'primer-post',
    summary: 'Hola mundo',
    content: 'Contenido',
    status: 'published',
    publishedAt: now,
  });

  for (const lang of langs) {
    await db.collection('posts').add({
      lang,
      title: `Demo Post (${lang})`,
      slug: `demo-post-${lang}`,
      summary: 'Resumen demo',
      content: '# Hola\nContenido demo',
      categories: ['Educación'],
      tags: ['demo'],
      status: 'published',
      publishedAt: now,
    });
    await db.collection('courses').add({
      lang,
      title: `Demo Course (${lang})`,
      slug: `demo-course-${lang}`,
      summary: 'Curso demo',
      level: 'intro',
      durationHours: 3,
      topics: ['intro', 'llm'],
      status: 'published',
      publishedAt: now,
    });
  }
  console.log('Seed listo');

  // Seed de colaboradores principales (idempotente por nombre)
  const collaborators = [
    { name: 'Nicolás Valenzuela', role: 'Ingeniero de IA', logoUrl: 'https://placehold.co/200x200/1e293b/ffffff?text=NV', description: 'Ingeniero de IA con foco en soluciones aplicadas y MLOps.', website: 'https://example.com', type: 'Partner Tecnológico' },
    { name: 'Diego Ramírez', role: 'Psicólogo Organizacional', logoUrl: 'https://placehold.co/200x200/1e293b/ffffff?text=DR', description: 'Magíster en Gestión de RRHH y experto en IA para el desarrollo del talento.', website: 'https://example.com', type: 'Partner Académico' },
    { name: 'Pablo Soto', role: 'Geógrafo experto en IA', logoUrl: 'https://placehold.co/200x200/1e293b/ffffff?text=PS', description: 'Especialista en SIG e inteligencia geoespacial con IA.', website: 'https://example.com', type: 'Partner Académico' },
    { name: 'Ignacio Villarroel', role: 'Científico Cuántico y Experto en IA', logoUrl: 'https://placehold.co/200x200/1e293b/ffffff?text=IV', description: 'Investigador en cómputo cuántico y su integración con IA.', website: 'https://example.com', type: 'Partner Tecnológico' },
  ];
  for (const c of collaborators) {
    const exists = await db.collection('collaborators').where('name','==',c.name).limit(1).get();
    if (exists.empty) await db.collection('collaborators').add(c);
  }
  console.log('Seed colaboradores listo');

  // Seed de logos (idempotente por name y type)
  const logos = [
    // Empresas
    { name: 'BCI', imageUrl: 'https://firebasestorage.googleapis.com/v0/b/web-subeacademia.appspot.com/o/logos%2Flogo_bci.svg?alt=media', type: 'Empresa', createdAt: now },
    { name: 'Banco Santander', imageUrl: 'https://firebasestorage.googleapis.com/v0/b/web-subeacademia.appspot.com/o/public%2Flogos%2Fsantander.png?alt=media', type: 'Empresa', createdAt: now },
    { name: 'Falabella', imageUrl: 'https://firebasestorage.googleapis.com/v0/b/web-subeacademia.appspot.com/o/public%2Flogos%2Ffalabella.png?alt=media', type: 'Empresa', createdAt: now },
    { name: 'Ripley', imageUrl: 'https://firebasestorage.googleapis.com/v0/b/web-subeacademia.appspot.com/o/public%2Flogos%2Fripley.png?alt=media', type: 'Empresa', createdAt: now },
    { name: 'Microsoft', imageUrl: 'https://firebasestorage.googleapis.com/v0/b/web-subeacademia.appspot.com/o/public%2Flogos%2Fmicrosoft.png?alt=media', type: 'Empresa', createdAt: now },
    { name: 'Google', imageUrl: 'https://firebasestorage.googleapis.com/v0/b/web-subeacademia.appspot.com/o/public%2Flogos%2Fgoogle.png?alt=media', type: 'Empresa', createdAt: now },
    
    // Instituciones Educativas
    { name: 'Universidad de Chile', imageUrl: 'https://firebasestorage.googleapis.com/v0/b/web-subeacademia.appspot.com/o/public%2Flogos%2Fuchile.png?alt=media', type: 'Institución Educativa', createdAt: now },
    { name: 'Pontificia Universidad Católica', imageUrl: 'https://firebasestorage.googleapis.com/v0/b/web-subeacademia.appspot.com/o/public%2Flogos%2Fpuc.png?alt=media', type: 'Institución Educativa', createdAt: now },
    { name: 'Universidad de Santiago', imageUrl: 'https://firebasestorage.googleapis.com/v0/b/web-subeacademia.appspot.com/o/public%2Flogos%2Fusach.png?alt=media', type: 'Institución Educativa', createdAt: now },
    { name: 'Universidad Técnica Federico Santa María', imageUrl: 'https://firebasestorage.googleapis.com/v0/b/web-subeacademia.appspot.com/o/public%2Flogos%2Futfsm.png?alt=media', type: 'Institución Educativa', createdAt: now },
    { name: 'Universidad de Concepción', imageUrl: 'https://firebasestorage.googleapis.com/v0/b/web-subeacademia.appspot.com/o/public%2Flogos%2Fudec.png?alt=media', type: 'Institución Educativa', createdAt: now },
  ];

  for (const logo of logos) {
    const exists = await db.collection('logos').where('name','==',logo.name).where('type','==',logo.type).limit(1).get();
    if (exists.empty) await db.collection('logos').add(logo);
  }
  console.log('Seed logos listo');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

