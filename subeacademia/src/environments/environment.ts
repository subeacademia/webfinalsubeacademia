export const environment = {
  production: false,
  firebase: {
    apiKey: "AIzaSyAZZ4wdOfqdnB1X-vhd-pwsTMPvxpf2his",
    authDomain: "web-subeacademia.firebaseapp.com",
    projectId: "web-subeacademia",
    // storageBucket eliminado: usamos bucket explícito en app.config.ts
    messagingSenderId: "933308887042",
    appId: "1:933308887042:web:a12c5128629eea99a1771b",
    measurementId: "G-KC1T2FD7JB"
  },
  storage: {
    // Carpeta por defecto para archivos públicos
    defaultPublicFolder: 'public/media',
    // Base URL pública (si necesitas construir URLs manualmente)
    publicBaseUrl: 'https://firebasestorage.googleapis.com/v0/b/web-subeacademia.firebasestorage.app/o',
    consoleBaseUrl: 'https://web-subeacademia.firebasestorage.app'
  },
  // Lista de administradores de la app
  adminEmails: ["bruno@subeia.tech"],
  // reCAPTCHA v3 Site Key
  recaptchaV3SiteKey: "PON_AQUI_TU_SITE_KEY",
  // GA4 Measurement ID (fallback por defecto si no se reemplaza)
  ga4MeasurementId: "G-KC1T2FD7JB",
  // Endpoint del backend de IA (por ejemplo, en Vercel)
  backendIaUrl: "PON_AQUI_TU_ENDPOINT_VERCEL",
  // Endpoint alternativo para Azure Function generate
  azureGenerateEndpoint: "https://apisube-smoky.vercel.app/api/azure/generate",
  apiUrl: '/api/azure/generate', // Asegúrate de que la URL sea ESTA RUTA RELATIVA.
  // URL de la API de GPT para desarrollo
  gptApiUrl: '/api/azure/generate',
  // API Key de Google Gemini (NUNCA hardcodear en repositorio público)
  // Se espera en runtime vía window.__env.geminiApiKey o usar backendIaUrl (deshabilitado)
  // geminiApiKey: 'TU_API_KEY_AQUI',
  // No se usan emuladores en prod
  useEmulators: false,
  settings: {} as { searchConsoleVerification?: string },
  contactEndpoint: ""
};