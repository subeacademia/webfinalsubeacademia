const functions = require("firebase-functions");
const admin = require("firebase-admin");
const puppeteer = require("puppeteer");

admin.initializeApp();

// Función para procesar leads cuando se crea un diagnóstico
exports.processLead = functions
  .region("us-central1")
  .firestore.document("diagnostics/{diagnosticId}")
  .onCreate(async (snap, context) => {
    const data = snap.data();
    const diagnosticId = context.params.diagnosticId;

    console.log(`Procesando lead para diagnóstico: ${diagnosticId}`);

    try {
      // Extraer información del lead del diagnóstico
      const leadData = data.diagnosticData?.lead || data.form?.lead;
      
      if (leadData && leadData.email) {
        // Crear entrada en la colección leads
        const leadsCollection = admin.firestore().collection('leads');
        
        const leadDoc = {
          email: leadData.email,
          nombre: leadData.nombre || leadData.name || 'Sin nombre',
          empresa: leadData.empresa || leadData.company || 'Sin empresa',
          telefono: leadData.telefono || leadData.phone || '',
          fecha_creacion: admin.firestore.FieldValue.serverTimestamp(),
          fuente: 'diagnostico_ia',
          diagnostic_id: diagnosticId,
          estado: 'nuevo',
          scores: data.scores || {},
          resumen_ejecutivo: data.report?.resumen_ejecutivo || '',
          puntaje_total: data.scores?.ares?.total || 0
        };

        await leadsCollection.add(leadDoc);
        console.log(`Lead procesado exitosamente: ${leadData.email}`);
      } else {
        console.log('No se encontró información de lead válida en el diagnóstico');
      }
    } catch (error) {
      console.error('Error procesando lead:', error);
    }
  });

// Función para generar PDF con Puppeteer
exports.generatePDF = functions
  .region("us-central1")
  .https.onCall(async (data, context) => {
    try {
      const browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
      });

      const page = await browser.newPage();
      await page.setContent(data.html);
      await page.waitForTimeout(2000);

      const pdf = await page.pdf({
        format: 'A4',
        printBackground: true,
        margin: {
          top: '20mm',
          right: '20mm',
          bottom: '20mm',
          left: '20mm'
        }
      });

      await browser.close();

      return { pdf: pdf.toString('base64') };
    } catch (error) {
      console.error('Error generando PDF:', error);
      throw new functions.https.HttpsError('internal', 'Error generando PDF');
    }
  });

