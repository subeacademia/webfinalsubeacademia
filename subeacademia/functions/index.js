/* Firebase Cloud Functions - sendEmail via SMTP + optional reCAPTCHA v3 validation */
const cors = require('cors');
const nodemailer = require('nodemailer');
const { onRequest } = require('firebase-functions/v2/https');
const { logger } = require('firebase-functions');
const admin = require('firebase-admin');

try {
  if (!admin.apps.length) {
    admin.initializeApp();
  }
} catch (err) {
  // ignore double init in emulator
}

const corsMiddleware = cors({
  origin: process.env.CORS_ORIGIN || 'https://subeia.tech' || true,
  methods: ['POST', 'OPTIONS'],
});

async function verifyRecaptchaV3(token, remoteIp) {
  const secret = process.env.RECAPTCHA_SECRET || '6LejfqArAAAAAAIMBRWhV1g7rKbs7634k-U1KHdB';
  if (!secret) {
    // If no secret configured, skip verification
    return { success: true, score: 1, skipped: true };
  }
  try {
    const params = new URLSearchParams();
    params.append('secret', secret);
    params.append('response', token || '');
    if (remoteIp) params.append('remoteip', remoteIp);

    const resp = await fetch('https://www.google.com/recaptcha/api/siteverify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: params.toString(),
    });
    const data = await resp.json();
    return data;
  } catch (e) {
    logger.error('reCAPTCHA verify error', e);
    return { success: false };
  }
}

function createTransporter() {
  const host = process.env.SMTP_HOST || 'smtp.hostinger.com';
  const port = Number(process.env.SMTP_PORT || 465);
  const user = process.env.SMTP_USER || 'contacto@subeia.tech';
  const pass = process.env.SMTP_PASS || 'Sube@2025';
  const secure = String(process.env.SMTP_SECURE || 'true').toLowerCase() === 'true' ? true : port === 465;
  if (!host || !port || !user || !pass) {
    throw new Error('SMTP env vars missing. Required: SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS');
  }
  return nodemailer.createTransport({
    host,
    port,
    secure,
    auth: { user, pass },
  });
}

exports.sendEmail = onRequest({
  cors: true,
  region: process.env.FUNCTION_REGION || 'us-central1',
  timeoutSeconds: 30,
}, (req, res) => {
  corsMiddleware(req, res, async () => {
    if (req.method === 'OPTIONS') {
      res.status(204).send('');
      return;
    }
    if (req.method !== 'POST') {
      res.status(405).json({ error: 'Method not allowed' });
      return;
    }
    try {
      const { name, email, message, recaptchaToken } = req.body || {};
      if (!name || !email || !message) {
        res.status(400).json({ error: 'Faltan campos requeridos' });
        return;
      }

      const verify = await verifyRecaptchaV3(recaptchaToken, req.ip);
      if (!verify.success) {
        res.status(400).json({ error: 'reCAPTCHA inválido' });
        return;
      }

      const transporter = createTransporter();

      const from = process.env.SMTP_FROM || process.env.SMTP_USER || 'contacto@subeia.tech';
      const to = process.env.SMTP_TO || process.env.SMTP_USER || 'contacto@subeia.tech';
      const subject = process.env.SMTP_SUBJECT || `[Contacto] ${name}`;

      const html = `
        <p><strong>Nombre:</strong> ${String(name)}</p>
        <p><strong>Email:</strong> ${String(email)}</p>
        <p><strong>Mensaje:</strong></p>
        <pre style="white-space: pre-wrap;">${String(message)}</pre>
      `;
      const text = `Nombre: ${name}\nEmail: ${email}\n\n${message}`;

      const info = await transporter.sendMail({
        from,
        to,
        replyTo: email,
        subject,
        text,
        html,
      });

      res.status(200).json({ ok: true, id: info.messageId });
    } catch (err) {
      logger.error('sendEmail error', err);
      res.status(500).json({ error: 'Error interno enviando el correo' });
    }
  });
});

