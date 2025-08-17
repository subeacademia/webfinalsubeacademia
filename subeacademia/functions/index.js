const functions = require("firebase-functions");
const admin = require("firebase-admin");
const puppeteer = require("puppeteer");

admin.initializeApp();

exports.generatePdfReport = functions
  .region("us-central1")
  .firestore.document("diagnostics/{diagnosticId}")
  .onCreate(async (snap, context) => {
    const data = snap.data();
    const diagnosticId = context.params.diagnosticId;

    console.log(`Iniciando PDF para diagnóstico: ${diagnosticId}`);

    try {
      const htmlContent = generateHTML(data);
      const browser = await puppeteer.launch({ args: ["--no-sandbox", "--disable-dev-shm-usage"] });
      const page = await browser.newPage();

      await page.setContent(htmlContent, { waitUntil: "networkidle0" });
      const pdfBuffer = await page.pdf({
        format: "A4",
        printBackground: true,
        margin: { top: "40px", right: "40px", bottom: "40px", left: "40px" },
      });

      await browser.close();

      const bucket = admin.storage().bucket();
      const filePath = `reports/${diagnosticId}.pdf`;
      const file = bucket.file(filePath);

      await file.save(pdfBuffer, { metadata: { contentType: "application/pdf" } });
      await file.makePublic();
      const publicUrl = file.publicUrl();

      console.log(`PDF subido a: ${publicUrl}`);
      return snap.ref.set({ pdfUrl: publicUrl }, { merge: true });

    } catch (error) {
      console.error(`Error al generar PDF para ${diagnosticId}:`, error);
      return snap.ref.set({ pdfError: error.message }, { merge: true });
    }
  });

function generateHTML({ report, scores }) {
  const { titulo_informe, resumen_ejecutivo, analisis_ares, plan_de_accion } = report;

  const formatDate = (date) => new Date(date).toLocaleDateString("es-CL", { year: 'numeric', month: 'long', day: 'numeric' });

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf8" />
      <title>${titulo_informe}</title>
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Roboto:wght@400;700&display=swap');
        body { font-family: 'Roboto', sans-serif; color: #333; font-size: 12px; line-height: 1.6; }
        .page { padding: 40px; }
        .header { text-align: center; border-bottom: 3px solid #00A896; padding-bottom: 20px; }
        .header img { width: 180px; }
        h1 { color: #023047; font-size: 28px; margin: 0; }
        h2 { color: #00A896; font-size: 20px; border-bottom: 1px solid #ddd; padding-bottom: 8px; margin-top: 35px; }
        h3 { color: #023047; font-size: 16px; }
        h4 { color: #333; font-size: 14px; margin-bottom: 5px; }
        p { margin: 0 0 10px 0; }
        .section { margin-bottom: 25px; }
        .plan-item { border-left: 3px solid #00A896; padding-left: 20px; margin-bottom: 25px; page-break-inside: avoid; }
        .ares-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
        .ares-item { background-color: #f7f9fa; padding: 15px; border-radius: 8px; }
        .footer { position: fixed; bottom: 0; left: 40px; right: 40px; text-align: center; font-size: 10px; color: #888; border-top: 1px solid #ddd; padding-top: 10px; }
      </style>
    </head>
    <body>
      <div class="page">
        <div class="header">
          <img src="https://firebasestorage.googleapis.com/v0/b/sube-academia.appspot.com/o/logos%2Fsube-academia-logo-dark.png?alt=media&token=e0c8b668-3e4b-48e2-9b88-0e96038a8e3f" alt="Logo Sube Academia">
        </div>
        <h1 style="text-align: center; margin-top: 30px;">${titulo_informe}</h1>
        <p style="text-align: center; font-size: 14px; color: #555;">Fecha de Emisión: ${formatDate(new Date())}</p>
        
        <div class="section">
          <h2>Resumen Ejecutivo</h2>
          <p>${resumen_ejecutivo}</p>
        </div>

        <div class="section">
          <h2>Análisis del Framework ARES-AI</h2>
          <div class="ares-grid">
            ${analisis_ares.map(item => `
              <div class="ares-item">
                <h3>${item.dimension} <span style="font-weight: normal; color: #555;">(${item.puntaje}/100)</span></h3>
                <p>${item.analisis}</p>
              </div>
            `).join("")}
          </div>
        </div>

        <div class="section">
          <h2>Plan de Acción Personalizado</h2>
          ${plan_de_accion.map(plan => `
            <div class="plan-item">
              <h3>Área de Mejora: ${plan.area_mejora}</h3>
              <p><strong>Desafío:</strong> ${plan.descripcion_problema}</p>
              ${plan.acciones_recomendadas.map(accion => `
                <div>
                  <h4>${accion.accion}</h4>
                  <p>${accion.detalle}</p>
                </div>
              `).join("")}
            </div>
          `).join("")}
        </div>
      </div>
      <div class="footer">
        Reporte generado por Sube Academia | www.subeacademia.cl
      </div>
    </body>
    </html>
  `;
}

