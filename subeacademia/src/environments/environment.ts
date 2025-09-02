export const environment = {
  production: false,
  firebase: {
    apiKey: "AIzaSyAZZ4wdOfqdnB1X-vhd-pwsTMPvxpf2his",
    authDomain: "web-subeacademia.firebaseapp.com",
    projectId: "web-subeacademia",
    storageBucket: "web-subeacademia.appspot.com",
    messagingSenderId: "933308887042",
    appId: "1:933308887042:web:a12c5128629eea99a1771b",
    measurementId: "G-KC1T2FD7JB"
  },
  // Lista de administradores de la app
  adminEmails: ["bruno@subeia.tech"],
  // reCAPTCHA v3 Site Key
  recaptchaV3SiteKey: "PON_AQUI_TU_SITE_KEY",
  // GA4 Measurement ID (fallback por defecto si no se reemplaza)
  ga4MeasurementId: "G-KC1T2FD7JB",
  // Endpoint del backend de IA (por ejemplo, en Vercel)
  backendIaUrl: "https://apisube-smoky.vercel.app/api/azure/generate",
  // Endpoint alternativo para Azure Function generate
  azureGenerateEndpoint: "https://apisube-smoky.vercel.app/api/azure/generate",
  // API Key de Google Gemini (deshabilitado - usando solo Vercel)
  // geminiApiKey: 'AIzaSyBhcmP7NTPJqF-pIuyS5rbZVXgxifaiMn8',
  // 🔧 SOLUCIÓN: Configuración mejorada de timeouts y reintentos
  api: {
    timeout: 30000, // 30 segundos
    maxRetries: 3,
    healthCheckTimeout: 10000, // 10 segundos
    diagnosticTimeout: 45000, // 45 segundos para diagnóstico completo
  },
  // Para activar emuladores en local, pon en true
  // y arranca: firebase emulators:start
  useEmulators: false,
  settings: {} as { searchConsoleVerification?: string },
  contactEndpoint: ""
};

