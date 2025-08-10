export const environment = {
  production: false,
  firebase: {
    apiKey: "AIzaSyAZZ4wdOfqdnB1X-vhd-pwsTMPvxpf2his",
    authDomain: "web-subeacademia.firebaseapp.com",
    projectId: "web-subeacademia",
    storageBucket: "web-subeacademia.firebasestorage.app",
    messagingSenderId: "933308887042",
    appId: "1:933308887042:web:a12c5128629eea99a1771b",
    measurementId: "G-KC1T2FD7JB"
  },
  adminEmails: ["bruno@subeia.tech"],
  recaptchaV3SiteKey: "6LejfqArAAAAAM5SX8uEcX6pnw9onAdYcGNzRsXW",
  ga4MeasurementId: "G-STV4N3EN88",
  backendIaUrl: "https://apisube-smoky.vercel.app/api/azure/generate",
  // Endpoint local del emulador de Functions (ajusta el projectId si cambia)
  contactEndpoint: "http://127.0.0.1:5001/web-subeacademia/us-central1/sendEmail",
  settings: {
    // Añade tu token de verificación si corresponde
    // searchConsoleVerification: "google-xxxxxxxxxxxxxxxx.html"
  } as { searchConsoleVerification?: string }
};

