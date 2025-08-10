## Functions (SMTP + reCAPTCHA v3)

1) Instalar dependencias
- Ir a `subeacademia/functions/` y ejecutar `npm install`.

2) Variables de entorno (crear `subeacademia/functions/.env`):
- `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `SMTP_SECURE=false|true`
- `SMTP_FROM`, `SMTP_TO`, `SMTP_SUBJECT` (opcional)
- `RECAPTCHA_SECRET` (opcional)
- `CORS_ORIGIN` (dominio del frontend)

3) Emular local
- En la raíz del repo: `firebase emulators:start --only functions`
- Endpoint: `POST http://127.0.0.1:5001/<project-id>/us-central1/sendEmail`

4) Desplegar
- `firebase deploy --only functions`

Notas:
- Si no configuras `RECAPTCHA_SECRET`, la verificación se omite (uso opcional).
- Configura en el frontend `environment.contactEndpoint` con la URL de la Function.
