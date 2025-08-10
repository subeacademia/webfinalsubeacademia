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
  // TODO: Rellenar con la clave de reCAPTCHA v3
  recaptchaV3SiteKey: "",
  // TODO: Rellenar con el Measurement ID de GA4
  ga4MeasurementId: "",
  // TODO: Rellenar con la URL del backend de IA
  backendIaUrl: "",
  // Para activar emuladores en local, pon en true
  // y arranca: firebase emulators:start
  useEmulators: false,
  settings: {} as { searchConsoleVerification?: string },
  contactEndpoint: ""
};

