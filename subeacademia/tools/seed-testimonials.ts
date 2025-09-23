import { initializeApp, applicationDefault } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

async function main() {
  initializeApp({ credential: applicationDefault() });
  const db = getFirestore();
  const now = new Date();

  console.log('Iniciando seed de testimonios...');

  // Seed de testimonios
  const testimonials = [
    {
      name: 'María González',
      company: 'TechCorp Solutions',
      position: 'Directora de Innovación',
      testimonial: 'La implementación de IA en nuestra empresa ha sido revolucionaria. En solo 6 meses aumentamos nuestra eficiencia operativa en un 40% y redujimos costos significativamente. El equipo de SubeAcademia nos guió paso a paso en todo el proceso.',
      photoUrl: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face',
      rating: 5,
      isActive: true,
      displayOrder: 1,
      createdAt: now
    },
    {
      name: 'Carlos Rodríguez',
      company: 'Universidad Nacional',
      position: 'Decano de Ingeniería',
      testimonial: 'Como institución educativa, necesitábamos modernizar nuestros procesos académicos. La solución de IA implementada nos permitió personalizar el aprendizaje de nuestros estudiantes y mejorar significativamente los resultados académicos.',
      photoUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
      rating: 5,
      isActive: true,
      displayOrder: 2,
      createdAt: now
    },
    {
      name: 'Ana Martínez',
      company: 'RetailMax',
      position: 'CEO',
      testimonial: 'La transformación digital con IA ha sido clave para nuestro crecimiento. Implementamos un sistema de recomendaciones que aumentó nuestras ventas en un 35% y mejoró la experiencia del cliente de manera extraordinaria.',
      photoUrl: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
      rating: 5,
      isActive: true,
      displayOrder: 3,
      createdAt: now
    },
    {
      name: 'Roberto Silva',
      company: 'FinTech Innovators',
      position: 'CTO',
      testimonial: 'El diagnóstico de madurez en IA nos abrió los ojos sobre las oportunidades que teníamos. La hoja de ruta personalizada nos permitió priorizar correctamente las iniciativas y obtener ROI desde el primer mes.',
      photoUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
      rating: 5,
      isActive: true,
      displayOrder: 4,
      createdAt: now
    },
    {
      name: 'Laura Fernández',
      company: 'Healthcare Plus',
      position: 'Directora Médica',
      testimonial: 'En el sector salud, la precisión es crucial. La IA implementada nos ayuda a diagnosticar más rápido y con mayor precisión, mejorando la calidad de atención a nuestros pacientes y optimizando nuestros recursos.',
      photoUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop&crop=face',
      rating: 5,
      isActive: true,
      displayOrder: 5,
      createdAt: now
    }
  ];

  for (const testimonial of testimonials) {
    const exists = await db.collection('testimonials').where('name', '==', testimonial.name).where('company', '==', testimonial.company).limit(1).get();
    if (exists.empty) {
      await db.collection('testimonials').add(testimonial);
      console.log(`Testimonio de ${testimonial.name} agregado`);
    } else {
      console.log(`Testimonio de ${testimonial.name} ya existe`);
    }
  }

  console.log('Seed de testimonios completado');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
