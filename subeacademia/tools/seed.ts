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

  // Seed básico de colaboradores si no existen (idempotente por nombre)
  const collaborators = [
    { name: 'Nataly Saavedra', logoUrl: 'https://placehold.co/200x64/111827/22d3ee?text=NS', description: 'Especialista en derecho tecnológico y regulaciones de IA con amplia experiencia en compliance y gobernanza digital.', website: 'https://example.com', type: 'Partner Académico' },
    { name: 'Lina Barraza', logoUrl: 'https://placehold.co/200x64/111827/22d3ee?text=LB', description: 'Psicología organizacional y desarrollo de competencias humanas para la era de la IA.', website: 'https://example.com', type: 'Partner Académico' },
    { name: 'Ignacio Lipski', logoUrl: 'https://placehold.co/200x64/111827/22d3ee?text=IL', description: 'Estratega de marketing digital especializado en tecnologías emergentes y transformación digital.', website: 'https://example.com', type: 'Cliente Destacado' },
    { name: 'Carlos Baldovinos', logoUrl: 'https://placehold.co/200x64/111827/22d3ee?text=CB', description: 'Análisis geoespacial y aplicaciones de IA en ciencias de la tierra y medio ambiente.', website: 'https://example.com', type: 'Partner Tecnológico' },
  ];
  for (const c of collaborators) {
    const exists = await db.collection('collaborators').where('name','==',c.name).limit(1).get();
    if (exists.empty) await db.collection('collaborators').add(c);
  }
  console.log('Seed colaboradores listo');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

