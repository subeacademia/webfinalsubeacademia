import {
  AngularNodeAppEngine,
  createNodeRequestHandler,
  isMainModule,
  writeResponseToNodeResponse,
} from '@angular/ssr/node';
import express, { Request, Response } from 'express';
import { join } from 'node:path';

// Esta línea es crucial para el nuevo método de importación
type Fetch = typeof import('node-fetch').default;

const browserDistFolder = join(import.meta.dirname, '../browser');

const app = express();
const angularApp = new AngularNodeAppEngine();

// Middleware para parsear JSON
app.use(express.json());

// ** INICIO DE RUTA PROXY PARA API EXTERNA **
const VERCEL_API_URL = 'https://apisube-smoky.vercel.app/api/azure/generate';

app.post('/api/proxy/generate', async (req: Request, res: Response): Promise<void> => {
  // Importación dinámica de node-fetch
  const fetch: Fetch = (await import('node-fetch')).default;

  try {
    const { prompt, system } = req.body;
    console.log('Proxy received request. Calling Vercel API...');

    if (!prompt || !system) {
      res.status(400).json({ error: 'El cuerpo de la petición debe incluir "prompt" y "system".' });
      return;
    }

    const response = await fetch(VERCEL_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ prompt, system }),
    });

    const responseText = await response.text();
    console.log('Received response from Vercel API. Status:', response.status);

    if (!response.ok) {
      console.error('Vercel API returned an error:', response.status, responseText);
      res.status(response.status).send(responseText);
      return;
    }
    
    res.setHeader('Content-Type', 'text/plain');
    res.send(responseText);

  } catch (error: any) {
    console.error('Error en el proxy de la API:', error);
    res.status(500).json({ error: 'Error interno del servidor al contactar la API externa.', details: error.message });
  }
});
// ** FIN DE RUTA PROXY **

/**
 * Serve static files from /browser
 */
app.use(
  express.static(browserDistFolder, {
    maxAge: '1y',
    index: false,
    redirect: false,
  }),
);

/**
 * Handle all other requests by rendering the Angular application.
 */
app.use((req, res, next) => {
  angularApp
    .handle(req)
    .then((response) =>
      response ? writeResponseToNodeResponse(response, res) : next(),
    )
    .catch(next);
});

/**
 * Start the server if this module is the main entry point.
 * The server listens on the port defined by the `PORT` environment variable, or defaults to 4000.
 */
if (isMainModule(import.meta.url)) {
  const port = process.env['PORT'] || 4000;
  app.listen(port, (error) => {
    if (error) {
      throw error;
    }

    console.log(`Node Express server listening on http://localhost:${port}`);
  });
}

/**
 * Request handler used by the Angular CLI (for dev-server and during build) or Firebase Cloud Functions.
 */
export const reqHandler = createNodeRequestHandler(app);
