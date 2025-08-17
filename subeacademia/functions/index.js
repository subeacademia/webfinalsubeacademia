/* Firebase Cloud Functions - sendEmail via SMTP + optional reCAPTCHA v3 validation */
const cors = require('cors');
const nodemailer = require('nodemailer');
const { onRequest, onDocumentWritten } = require('firebase-functions/v2/https');
const { onWrite } = require('firebase-functions/v2/firestore');
const { logger } = require('firebase-functions');
const admin = require('firebase-admin');
const puppeteer = require('puppeteer');

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

// Cloud Function para generar PDFs automáticamente
exports.generatePdfReport = onWrite({
  document: 'users/{userId}/diagnostics/{diagnosticId}',
  region: process.env.FUNCTION_REGION || 'us-central1',
  timeoutSeconds: 300, // 5 minutos para generar PDF
  memory: '2GiB', // Memoria necesaria para Puppeteer
}, async (event) => {
  try {
    // Solo procesar si es un documento nuevo
    if (!event.data.after.exists()) {
      logger.info('Documento eliminado, no se genera PDF');
      return;
    }

    const diagnosticData = event.data.after.data();
    const userId = event.params.userId;
    const diagnosticId = event.params.diagnosticId;

    logger.info(`Generando PDF para diagnóstico ${diagnosticId} del usuario ${userId}`);

    // Verificar que no se haya generado ya un PDF
    if (diagnosticData.pdfUrl) {
      logger.info(`PDF ya existe para diagnóstico ${diagnosticId}`);
      return;
    }

    // Generar HTML del reporte
    const htmlContent = generateReportHtml(diagnosticData);
    
    // Generar PDF con Puppeteer
    const pdfBuffer = await generatePdfFromHtml(htmlContent);
    
    // Subir PDF a Firebase Storage
    const bucket = admin.storage().bucket();
    const pdfFileName = `reports/${userId}/${diagnosticId}.pdf`;
    const file = bucket.file(pdfFileName);
    
    await file.save(pdfBuffer, {
      metadata: {
        contentType: 'application/pdf',
        metadata: {
          userId: userId,
          diagnosticId: diagnosticId,
          generatedAt: new Date().toISOString()
        }
      }
    });

    // Hacer el archivo público y obtener URL
    await file.makePublic();
    const pdfUrl = `https://storage.googleapis.com/${bucket.name}/${pdfFileName}`;

    // Actualizar el documento con la URL del PDF
    const diagnosticRef = admin.firestore()
      .collection('users')
      .doc(userId)
      .collection('diagnostics')
      .doc(diagnosticId);
    
    await diagnosticRef.update({
      pdfUrl: pdfUrl,
      pdfGeneratedAt: admin.firestore.FieldValue.serverTimestamp()
    });

    logger.info(`PDF generado exitosamente para diagnóstico ${diagnosticId}: ${pdfUrl}`);

  } catch (error) {
    logger.error(`Error generando PDF para diagnóstico ${event.params.diagnosticId}:`, error);
    
    // Intentar actualizar el documento con información del error
    try {
      const diagnosticRef = admin.firestore()
        .collection('users')
        .doc(event.params.userId)
        .collection('diagnostics')
        .doc(event.params.diagnosticId);
      
      await diagnosticRef.update({
        pdfError: error.message,
        pdfErrorAt: admin.firestore.FieldValue.serverTimestamp()
      });
    } catch (updateError) {
      logger.error('Error actualizando documento con información del error:', updateError);
    }
  }
});

// Función para generar el HTML del reporte
function generateReportHtml(diagnosticData) {
  const { form, scores, analysisContent, fecha, puntajeGeneral } = diagnosticData;
  
  // Función helper para formatear fecha
  const formatDate = (date) => {
    if (date instanceof Date) {
      return date.toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    }
    if (date && date.toDate) {
      return date.toDate().toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    }
    return 'Fecha no disponible';
  };

  // Función helper para obtener nivel de competencia
  const getCompetencyLevel = (score) => {
    if (score >= 80) return 'Alto';
    if (score >= 60) return 'Medio';
    if (score >= 40) return 'Bajo';
    return 'Muy Bajo';
  };

  // Función helper para obtener color del semáforo ARES
  const getAresColor = (score) => {
    if (score >= 80) return '#10B981'; // Verde
    if (score >= 60) return '#F59E0B'; // Amarillo
    if (score >= 40) return '#F97316'; // Naranja
    return '#EF4444'; // Rojo
  };

  return `
    <!DOCTYPE html>
    <html lang="es">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Reporte de Diagnóstico - Sube Academia</title>
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
        
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        
        body {
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
          line-height: 1.6;
          color: #1F2937;
          background: #FFFFFF;
          font-size: 12px;
        }
        
        .header {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          padding: 40px;
          text-align: center;
          margin-bottom: 40px;
        }
        
        .logo {
          font-size: 32px;
          font-weight: 700;
          margin-bottom: 10px;
        }
        
        .subtitle {
          font-size: 18px;
          font-weight: 400;
          opacity: 0.9;
        }
        
        .container {
          max-width: 800px;
          margin: 0 auto;
          padding: 0 40px;
        }
        
        .section {
          margin-bottom: 40px;
          page-break-inside: avoid;
        }
        
        .section-title {
          font-size: 24px;
          font-weight: 600;
          color: #374151;
          margin-bottom: 20px;
          padding-bottom: 10px;
          border-bottom: 3px solid #E5E7EB;
        }
        
        .info-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
          margin-bottom: 20px;
        }
        
        .info-item {
          background: #F9FAFB;
          padding: 20px;
          border-radius: 8px;
          border-left: 4px solid #667eea;
        }
        
        .info-label {
          font-weight: 600;
          color: #6B7280;
          margin-bottom: 5px;
          font-size: 11px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        
        .info-value {
          font-size: 14px;
          font-weight: 500;
          color: #1F2937;
        }
        
        .score-card {
          background: #FFFFFF;
          border: 2px solid #E5E7EB;
          border-radius: 12px;
          padding: 20px;
          margin-bottom: 20px;
          text-align: center;
        }
        
        .overall-score {
          font-size: 48px;
          font-weight: 700;
          color: #667eea;
          margin-bottom: 10px;
        }
        
        .score-label {
          font-size: 14px;
          color: #6B7280;
          text-transform: uppercase;
          letter-spacing: 1px;
        }
        
        .competency-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 15px;
          margin-bottom: 20px;
        }
        
        .competency-item {
          background: #F9FAFB;
          padding: 15px;
          border-radius: 8px;
          border-left: 4px solid #667eea;
        }
        
        .competency-name {
          font-weight: 600;
          margin-bottom: 5px;
          font-size: 13px;
        }
        
        .competency-score {
          font-size: 20px;
          font-weight: 700;
          color: #667eea;
        }
        
        .competency-level {
          font-size: 11px;
          color: #6B7280;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          margin-top: 5px;
        }
        
        .ares-section {
          background: #F0F9FF;
          padding: 20px;
          border-radius: 12px;
          margin-bottom: 20px;
        }
        
        .ares-title {
          font-size: 18px;
          font-weight: 600;
          color: #0369A1;
          margin-bottom: 15px;
        }
        
        .ares-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 15px;
        }
        
        .ares-item {
          text-align: center;
          padding: 15px;
          background: white;
          border-radius: 8px;
          border: 2px solid #E5E7EB;
        }
        
        .ares-score {
          font-size: 24px;
          font-weight: 700;
          margin-bottom: 5px;
        }
        
        .ares-label {
          font-size: 11px;
          color: #6B7280;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        
        .analysis-section {
          background: #FEF3C7;
          padding: 20px;
          border-radius: 12px;
          margin-bottom: 20px;
        }
        
        .analysis-title {
          font-size: 18px;
          font-weight: 600;
          color: #92400E;
          margin-bottom: 15px;
        }
        
        .analysis-content {
          background: white;
          padding: 20px;
          border-radius: 8px;
          border-left: 4px solid #F59E0B;
        }
        
        .footer {
          text-align: center;
          padding: 40px;
          color: #6B7280;
          font-size: 11px;
          border-top: 1px solid #E5E7EB;
          margin-top: 40px;
        }
        
        .page-break {
          page-break-before: always;
        }
      </style>
    </head>
    <body>
      <div class="header">
        <div class="logo">🚀 Sube Academia</div>
        <div class="subtitle">Reporte de Diagnóstico de Competencias</div>
      </div>
      
      <div class="container">
        <div class="section">
          <h2 class="section-title">Información General</h2>
          <div class="info-grid">
            <div class="info-item">
              <div class="info-label">Fecha del Diagnóstico</div>
              <div class="info-value">${formatDate(fecha)}</div>
            </div>
            <div class="info-item">
              <div class="info-label">Objetivo</div>
              <div class="info-value">${form?.objetivo || 'No especificado'}</div>
            </div>
            <div class="info-item">
              <div class="info-label">Industria</div>
              <div class="info-value">${form?.contexto?.industria || 'No especificada'}</div>
            </div>
            <div class="info-item">
              <div class="info-label">Tamaño de Empresa</div>
              <div class="info-value">${form?.contexto?.tamanoEmpresa || form?.contexto?.tamanoEquipo || form?.contexto?.numEmpleados || 'No especificado'}</div>
            </div>
          </div>
        </div>
        
        <div class="section">
          <h2 class="section-title">Puntaje General</h2>
          <div class="score-card">
            <div class="overall-score">${puntajeGeneral || 0}</div>
            <div class="score-label">Puntaje Promedio</div>
          </div>
        </div>
        
        <div class="section">
          <h2 class="section-title">Análisis de Competencias</h2>
          <div class="competency-grid">
            ${scores?.competencias?.map(comp => `
              <div class="competency-item">
                <div class="competency-name">${comp.competenciaId}</div>
                <div class="competency-score">${comp.puntaje}</div>
                <div class="competency-level">${getCompetencyLevel(comp.puntaje)}</div>
              </div>
            `).join('') || 'No hay datos de competencias disponibles'}
          </div>
        </div>
        
        ${scores?.ares ? `
        <div class="section">
          <h2 class="section-title">Análisis ARES</h2>
          <div class="ares-section">
            <div class="ares-title">Evaluación de Recursos y Estrategias</div>
            <div class="ares-grid">
              ${Object.entries(scores.ares).map(([key, value]) => `
                <div class="ares-item">
                  <div class="ares-score" style="color: ${getAresColor(value)}">${value}</div>
                  <div class="ares-label">${key.toUpperCase()}</div>
                </div>
              `).join('')}
            </div>
          </div>
        </div>
        ` : ''}
        
        ${analysisContent ? `
        <div class="section page-break">
          <h2 class="section-title">Análisis de IA</h2>
          <div class="analysis-section">
            <div class="analysis-title">Resumen Ejecutivo</div>
            <div class="analysis-content">
              <h3>${analysisContent.titulo_informe || 'Análisis de Competencias'}</h3>
              <p>${analysisContent.resumen_ejecutivo || 'No hay análisis disponible'}</p>
            </div>
          </div>
          
          ${analysisContent.analisis_ares && analysisContent.analisis_ares.length > 0 ? `
          <div class="analysis-section">
            <div class="analysis-title">Análisis ARES Detallado</div>
            <div class="analysis-content">
              ${analysisContent.analisis_ares.map(analisis => `
                <div style="margin-bottom: 15px; padding: 15px; background: #F9FAFB; border-radius: 8px;">
                  <strong>${analisis.area || 'Área'}:</strong> ${analisis.analisis || 'Sin análisis disponible'}
                </div>
              `).join('')}
            </div>
          </div>
          ` : ''}
          
          ${analysisContent.plan_de_accion && analysisContent.plan_de_accion.length > 0 ? `
          <div class="analysis-section">
            <div class="analysis-title">Plan de Acción</div>
            <div class="analysis-content">
              ${analysisContent.plan_de_accion.map((accion, index) => `
                <div style="margin-bottom: 15px; padding: 15px; background: #F9FAFB; border-radius: 8px;">
                  <strong>Acción ${index + 1}:</strong> ${accion.accion || 'Sin acción especificada'}
                  ${accion.descripcion ? `<br><em>${accion.descripcion}</em>` : ''}
                </div>
              `).join('')}
            </div>
          </div>
          ` : ''}
        </div>
        ` : ''}
      </div>
      
      <div class="footer">
        <p>Reporte generado automáticamente por Sube Academia</p>
        <p>Fecha de generación: ${new Date().toLocaleDateString('es-ES')}</p>
      </div>
    </body>
    </html>
  `;
}

// Función para generar PDF desde HTML usando Puppeteer
async function generatePdfFromHtml(htmlContent) {
  let browser;
  try {
    // Lanzar navegador headless
    browser = await puppeteer.launch({
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--no-first-run',
        '--no-zygote',
        '--disable-gpu'
      ]
    });

    const page = await browser.newPage();
    
    // Configurar la página
    await page.setContent(htmlContent, { waitUntil: 'networkidle0' });
    
    // Generar PDF
    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: {
        top: '20mm',
        right: '20mm',
        bottom: '20mm',
        left: '20mm'
      }
    });

    return pdfBuffer;
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

