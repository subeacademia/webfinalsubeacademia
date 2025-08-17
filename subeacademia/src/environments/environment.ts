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
  backendIaUrl: "PON_AQUI_TU_ENDPOINT_VERCEL",
  // Endpoint alternativo para Azure Function generate
  azureGenerateEndpoint: "https://apisube-smoky.vercel.app/api/azure/generate",
  // API Key de Google Gemini
  geminiApiKey: 'AIzaSyBhcmP7NTPJqF-pIuyS5rbZVXgxifaiMn8',
  // Para activar emuladores en local, pon en true
  // y arranca: firebase emulators:start
  useEmulators: false,
  settings: {} as { searchConsoleVerification?: string },
  contactEndpoint: ""
};

