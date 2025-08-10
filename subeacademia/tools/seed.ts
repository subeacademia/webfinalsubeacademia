import { initializeApp, applicationDefault } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

async function main() {
  initializeApp({ credential: applicationDefault() });
  const db = getFirestore();

  const now = Date.now();
  const langs: Array<'es' | 'en' | 'pt'> = ['es', 'en', 'pt'];

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
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

