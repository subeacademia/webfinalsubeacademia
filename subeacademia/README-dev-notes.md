## Notas de desarrollo (Tailwind + Angular)

- Para arrancar limpio y evitar cachés de Angular CLI:
  - `npm run dev:clean`

- Si Tailwind no refleja cambios de estilos/clases:
  - Reinicia `ng serve`
  - Haz hard reload en el navegador (Ctrl/Cmd + Shift + R)

- Asegúrate de que Tailwind escanee el código:
  - En `tailwind.config.js` debe existir:
    - `darkMode: 'class'`
    - `content: ['src/**/*.{html,ts}']`

