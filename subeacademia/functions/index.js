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
  document: 'diagnostics/{diagnosticId}',
  region: process.env.FUNCTION_REGION || 'us-central1',
  timeoutSeconds: 300,
}, async (event) => {
  const diagnosticData = event.data.after.data();
  const diagnosticId = event.data.after.id;

  // Solo procesar si hay un reporte y no hay URL de PDF ya generada
  if (!diagnosticData.report || diagnosticData.pdfUrl) {
    return null;
  }

  logger.info(`Iniciando generación de PDF para el diagnóstico: ${diagnosticId}`);

  try {
    const htmlContent = generateDiagnosticReportHTML(diagnosticData);
    const pdfBuffer = await generatePdfFromHtml(htmlContent);

    // Guardar PDF en Storage
    const bucket = admin.storage().bucket();
    const filePath = `reports/${diagnosticId}.pdf`;
    const file = bucket.file(filePath);

    await file.save(pdfBuffer, {
      metadata: { contentType: 'application/pdf' },
    });

    // Hacer el archivo público para que se pueda descargar
    await file.makePublic();
    const publicUrl = file.publicUrl();

    logger.info(`PDF generado y subido a: ${publicUrl}`);

    // Actualizar el documento en Firestore con la URL del PDF
    return event.data.after.ref.set({ pdfUrl: publicUrl }, { merge: true });
  } catch (error) {
    logger.error('Error generando el PDF:', error);
    return null;
  }
});

// Función para generar HTML del reporte
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

// Función para generar HTML del reporte de diagnóstico
function generateDiagnosticReportHTML(data) {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf8" />
        <title>Reporte de Madurez en IA - Sube Academia</title>
        <style>
          body { 
            font-family: 'Helvetica Neue', 'Helvetica', 'Arial', sans-serif; 
            color: #333; 
            line-height: 1.6;
            margin: 0;
            padding: 0;
          }
          .header { 
            text-align: center; 
            margin-bottom: 40px; 
            border-bottom: 3px solid #005f73; 
            padding-bottom: 20px; 
            background: linear-gradient(135deg, #005f73 0%, #0a9396 100%);
            color: white;
            padding: 30px 20px;
          }
          .header h1 { 
            color: white; 
            margin: 0;
            font-size: 2.5em;
            text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
          }
          .header .subtitle {
            color: #e9d8a6;
            font-size: 1.2em;
            margin-top: 10px;
          }
          h2 { 
            color: #005f73; 
            border-bottom: 2px solid #e9d8a6; 
            padding-bottom: 10px; 
            margin-top: 40px; 
            font-size: 1.8em;
          }
          h3 {
            color: #0a9396;
            margin-top: 25px;
            font-size: 1.4em;
          }
          .section { 
            margin-bottom: 30px; 
            padding: 20px;
            background: #f8f9fa;
            border-radius: 8px;
          }
          .plan-item { 
            border-left: 4px solid #0a9396; 
            padding-left: 20px; 
            margin-bottom: 25px; 
            background: white;
            padding: 20px;
            border-radius: 8px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
          }
          .action-step {
            background: #e8f4f8;
            padding: 15px;
            margin: 10px 0;
            border-radius: 6px;
            border-left: 3px solid #005f73;
          }
          .action-step h4 {
            color: #005f73;
            margin: 0 0 10px 0;
            font-size: 1.1em;
          }
          .course-recommendation {
            background: #fff3cd;
            border: 1px solid #ffeaa7;
            padding: 10px;
            border-radius: 6px;
            margin-top: 10px;
          }
          .ares-analysis {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 20px;
            margin: 20px 0;
          }
          .ares-item {
            background: white;
            padding: 20px;
            border-radius: 8px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            border-top: 4px solid #0a9396;
          }
          .ares-score {
            font-size: 1.5em;
            font-weight: bold;
            color: #005f73;
            text-align: center;
            margin-bottom: 10px;
          }
          .footer {
            text-align: center;
            margin-top: 40px;
            padding: 20px;
            background: #f8f9fa;
            border-top: 1px solid #dee2e6;
            color: #6c757d;
          }
          .logo-placeholder {
            width: 120px;
            height: 60px;
            background: #e9d8a6;
            margin: 0 auto 20px;
            border-radius: 8px;
            display: flex;
            align-items: center;
            justify-content: center;
            color: #005f73;
            font-weight: bold;
            font-size: 0.9em;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="logo-placeholder">SUBE ACADEMIA</div>
          <h1>Reporte de Madurez en Inteligencia Artificial</h1>
          <div class="subtitle">Análisis Estratégico y Plan de Acción Personalizado</div>
        </div>
        
        <div class="section">
          <h2>Resumen Ejecutivo</h2>
          <p>${data.report?.resumen_ejecutivo || "No disponible"}</p>
        </div>
        
        ${data.report?.analisis_ares && data.report.analisis_ares.length > 0 ? `
        <div class="section">
          <h2>Análisis por Dimensión ARES-AI</h2>
          <div class="ares-analysis">
            ${data.report.analisis_ares.map(item => `
              <div class="ares-item">
                <div class="ares-score">${item.puntaje}/100</div>
                <h3>${item.dimension}</h3>
                <p>${item.analisis}</p>
              </div>
            `).join("")}
          </div>
        </div>
        ` : ''}
        
        ${data.report?.plan_de_accion && data.report.plan_de_accion.length > 0 ? `
        <div class="section">
          <h2>Plan de Acción Recomendado</h2>
          ${data.report.plan_de_accion.map((plan, index) => `
            <div class="plan-item">
              <h3>Área de Mejora ${index + 1}: ${plan.area_mejora}</h3>
              <p><em>${plan.descripcion_problema}</em></p>
              ${plan.acciones_recomendadas.map((accion, accIndex) => `
                <div class="action-step">
                  <h4>${accion.accion}</h4>
                  <p>${accion.detalle}</p>
                  ${accion.curso_recomendado_id ? `
                    <div class="course-recommendation">
                      <strong>🎯 Curso Recomendado:</strong> ID ${accion.curso_recomendado_id}
                    </div>
                  ` : ''}
                </div>
              `).join("")}
            </div>
          `).join("")}
        </div>
        ` : ''}
        
        <div class="footer">
          <p><strong>Reporte generado automáticamente por Sube Academia</strong></p>
          <p>Fecha de generación: ${new Date().toLocaleDateString('es-ES', { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          })}</p>
          <p>Este reporte es confidencial y está destinado únicamente para uso interno de la organización.</p>
        </div>
      </body>
    </html>
  `;
}

