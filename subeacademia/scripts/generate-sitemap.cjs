/* eslint-disable */
const { writeFileSync, mkdirSync } = require('fs');
const { resolve } = require('path');
const { SitemapStream, streamToPromise } = require('sitemap');

async function main() {
  const distBrowser = resolve(__dirname, '..', 'dist', 'subeacademia', 'browser');
  const baseUrl = 'https://www.subeacademia.cl';

  const langs = ['es', 'pt', 'en'];
  const baseRoutes = ['', 'blog', 'cursos', 'contacto', 'ia'];

  const links = [];
  for (const lang of langs) {
    for (const route of baseRoutes) {
      const url = route ? `/${lang}/${route}` : `/${lang}`;
      links.push({ url, changefreq: 'weekly', priority: route ? 0.7 : 0.9 });
    }
  }

  const smStream = new SitemapStream({ hostname: baseUrl, xmlns: { news: false, xhtml: true, image: true, video: false } });
  links.forEach((l) => smStream.write(l));
  smStream.end();
  const xml = await streamToPromise(smStream).then((data) => data.toString());

  mkdirSync(distBrowser, { recursive: true });
  writeFileSync(resolve(distBrowser, 'sitemap.xml'), xml, 'utf8');
  console.log('sitemap.xml generado en', resolve(distBrowser, 'sitemap.xml'));
}

main().catch((err) => {
  console.error('Error generando sitemap:', err);
  process.exit(1);
});

