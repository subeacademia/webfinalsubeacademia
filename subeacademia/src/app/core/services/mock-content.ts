import { Post } from '../models/post.model';
import { Course } from '../models/course.model';

export function getMockPosts(lang: 'es' | 'en' | 'pt'): Post[] {
  const now = Date.now();
  const common = {
    status: 'published' as const,
    media: [],
    authors: [{ name: 'Equipo Sube Academ-IA' }],
    categories: ['IA', 'Educación'],
    tags: ['ia', 'educacion'],
  coverUrl: 'assets/og-placeholder.svg',
  };
  if (lang === 'es') {
    return [
      {
        id: 'mock-es-1', lang, title: 'Introducción a la IA en educación', slug: 'introduccion-ia-educacion',
        summary: 'Conceptos clave y aplicaciones rápidas para el aula.',
        content: '# IA en educación\n\nEmpezar con IA de forma práctica.',
        publishedAt: now - 86400000 * 3, ...common,
      },
      {
        id: 'mock-es-2', lang, title: 'RAG minimal para datos internos', slug: 'rag-minimal-datos-internos',
        summary: 'De cero a valor con tu propio contenido.',
        content: '## RAG minimal\nPasos esenciales.',
        publishedAt: now - 86400000 * 5, ...common,
      },
      {
        id: 'mock-es-3', lang, title: 'Evaluar LLMs con métricas útiles', slug: 'evaluar-llms-metricas',
        summary: 'Qué medir y cómo observar el impacto.',
        content: '## Métricas\nCalidad y costo.',
        publishedAt: now - 86400000 * 7, ...common,
      },
    ];
  }
  if (lang === 'en') {
    return [
      {
        id: 'mock-en-1', lang, title: 'Introduction to AI in education', slug: 'introduction-ai-education',
        summary: 'Key concepts and quick wins for the classroom.',
        content: '# AI in education\nStart practical.',
        publishedAt: now - 86400000 * 3, ...common,
      },
      { id: 'mock-en-2', lang, title: 'Minimal RAG for internal docs', slug: 'minimal-rag-internal-docs', summary: 'Value fast with your own content.', content: '## Minimal RAG', publishedAt: now - 86400000 * 5, ...common },
      { id: 'mock-en-3', lang, title: 'Evaluating LLMs that matter', slug: 'evaluating-llms-that-matter', summary: 'Metrics that move the needle.', content: '## Metrics', publishedAt: now - 86400000 * 7, ...common },
    ];
  }
  return [
    { id: 'mock-pt-1', lang, title: 'Introdução à IA na educação', slug: 'introducao-ia-educacao', summary: 'Conceitos e ganhos rápidos.', content: '# IA na educação', publishedAt: now - 86400000 * 3, ...common },
    { id: 'mock-pt-2', lang, title: 'RAG minimal para conteúdos internos', slug: 'rag-minimal-conteudos-internos', summary: 'Do zero ao valor.', content: '## RAG minimal', publishedAt: now - 86400000 * 5, ...common },
    { id: 'mock-pt-3', lang, title: 'Avaliando LLMs com métricas úteis', slug: 'avaliando-llms-metricas', summary: 'O que medir e por quê.', content: '## Métricas', publishedAt: now - 86400000 * 7, ...common },
  ];
}

export function getMockCourses(lang: 'es' | 'en' | 'pt'): Course[] {
  const now = Date.now();
  const common = {
    status: 'published' as const,
    resources: [],
    topics: ['IA', 'LLMs'],
  coverUrl: 'assets/og-placeholder.svg',
  };
  if (lang === 'es') {
    return [
      { id: 'mockc-es-1', lang, title: 'Fundamentos de IA para docentes', slug: 'fundamentos-ia-docentes', summary: 'Bases y actividades para el aula.', level: 'intro', durationHours: 8, publishedAt: now - 86400000 * 4, ...common },
      { id: 'mockc-es-2', lang, title: 'Automatización con IA', slug: 'automatizacion-ia', summary: 'Flujos con agentes y APIs.', level: 'intermedio', durationHours: 10, publishedAt: now - 86400000 * 6, ...common },
      { id: 'mockc-es-3', lang, title: 'Prompt Engineering avanzado', slug: 'prompt-engineering-avanzado', summary: 'Tácticas y evaluación.', level: 'avanzado', durationHours: 12, publishedAt: now - 86400000 * 8, ...common },
    ];
  }
  if (lang === 'en') {
    return [
      { id: 'mockc-en-1', lang, title: 'AI fundamentals for teachers', slug: 'ai-fundamentals-teachers', summary: 'Basics and classroom activities.', level: 'intro', durationHours: 8, publishedAt: now - 86400000 * 4, ...common },
      { id: 'mockc-en-2', lang, title: 'Automation with AI', slug: 'automation-with-ai', summary: 'Agents and API flows.', level: 'intermedio', durationHours: 10, publishedAt: now - 86400000 * 6, ...common },
      { id: 'mockc-en-3', lang, title: 'Advanced prompt engineering', slug: 'advanced-prompt-engineering', summary: 'Tactics and evaluation.', level: 'avanzado', durationHours: 12, publishedAt: now - 86400000 * 8, ...common },
    ];
  }
  return [
    { id: 'mockc-pt-1', lang, title: 'Fundamentos de IA para docentes', slug: 'fundamentos-ia-docentes-pt', summary: 'Bases e atividades.', level: 'intro', durationHours: 8, publishedAt: now - 86400000 * 4, ...common },
    { id: 'mockc-pt-2', lang, title: 'Automação com IA', slug: 'automacao-com-ia', summary: 'Agentes e APIs.', level: 'intermedio', durationHours: 10, publishedAt: now - 86400000 * 6, ...common },
    { id: 'mockc-pt-3', lang, title: 'Prompt Engineering avançado', slug: 'prompt-engineering-avancado', summary: 'Táticas e avaliação.', level: 'avanzado', durationHours: 12, publishedAt: now - 86400000 * 8, ...common },
  ];
}

