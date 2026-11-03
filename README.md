# Pablo Suárez Peña

Portfolio editorial en español e inglés, con proyectos de GitHub y blog personal. La web es estática; Node.js genera las páginas del blog a partir de los artículos Markdown del repositorio.

## Desarrollo y publicación

Requiere Node.js 22 o posterior.

```sh
npm ci
npm run dev
```

Abre `http://127.0.0.1:4173`. Al guardar un archivo en `content/posts/`, el servidor regenera el blog. Recarga el navegador para ver los cambios. Para comprobar la generación de publicaciones: `npm test`.

En Vercel, el repositorio usa `npm run build` y publica `dist/`. Mantén el preset de framework en **Other**. Si el proyecto ya está conectado a GitHub, los commits en `main` generan un despliegue. También se puede servir `dist/` con cualquier servidor de archivos estáticos.

## Proyectos

El catálogo muestra Pulso, Build Your Agents, Siarem, Facturas Excel a PDF y Agent Action Firewall. Las descripciones se contrastaron con sus README públicos el 3 de noviembre de 2026. Se excluyen Agentic Mission Control, forks, archivados y repositorios de perfil, configuración y versiones anteriores de la web.

`content/projects.json` contiene las exclusiones y las descripciones editoriales en español e inglés. `dist/data/projects.json` conserva una copia pública. Para actualizarla y regenerar el HTML:

```sh
npm run sync:projects
npm run build
```

Al abrir proyectos, la web consulta los repositorios de GitHub y conserva el catálogo HTML si falla la conexión. Los nuevos repositorios propios no excluidos aparecen con su descripción de GitHub; añade una descripción editorial a `content/projects.json` para personalizarlos. La actividad de GitHub también oculta Mission Control. No se usa ningún token para consultar repositorios públicos.

## Blog: escribir desde el código

- `/blog/`: publicaciones con búsqueda y filtros **Personal** y **Trabajo**.
- `/blog/<slug>/`: cada artículo tiene una página propia, resumen, fecha, tiempo de lectura y metadatos para compartir.
- `/blog/rss.xml`: feed RSS.
- `/#blog`: vista del blog dentro del portfolio. El antiguo `/#escritos` sigue abriendo esta sección.

Los artículos se editan en `content/posts/*.md` con el editor de código. Las imágenes se guardan en `dist/assets/uploads/`. El nombre del archivo determina la URL: `mi-articulo.md` se publica en `/blog/mi-articulo/`.

### Crear y editar un artículo

```sh
npm run post:new -- mi-articulo
npm run dev
```

El primer comando crea `content/posts/mi-articulo.md` a partir de `content/templates/post.md`, con la fecha actual y `draft: true`. Conserva cualquier archivo que ya exista con ese nombre. Edita el título, resumen, categoría y contenido:

```md
---
title: "Una nota sobre lo que estoy aprendiendo"
summary: "Una o dos frases para presentar la publicación."
date: '2026-11-03'
category: personal
draft: true
---

El contenido del artículo, con **formato**, enlaces e imágenes.
```

Categorías permitidas: `personal` y `trabajo`. El nombre del archivo debe usar minúsculas, números y guiones. Usa comillas en títulos y resúmenes, especialmente si incluyen dos puntos.

Los artículos con `draft: true` quedan fuera de las páginas públicas, el listado y el RSS. Para publicar, cambia a `draft: false` y usa una fecha igual o anterior a la de publicación. El build rechaza fechas futuras; las publicaciones programadas requieren otro despliegue. Los borradores subidos al repositorio público se pueden leer en GitHub.

Para añadir una imagen, crea `dist/assets/uploads/` si hace falta, guarda el archivo y usa su ruta pública:

```md
![Descripción de la imagen](/assets/uploads/mi-imagen.webp)
```

### Subir y publicar los cambios

```sh
npm test
npm run build
git add content/posts dist/blog dist/data/blog.json
git commit -m "content: publicar mi articulo"
git push origin main
```

Añade también los archivos de imagen que hayas utilizado. Si trabajas en una rama, integra sus cambios en `main` para que Vercel publique la nueva versión. El build genera las páginas, el listado y el RSS; también actualiza artículos editados y elimina las páginas de publicaciones retiradas.

La portada mantiene ES/EN. El blog está en español; los artículos se muestran en el idioma en el que se escriben.

## Historial del diseño

Las siguientes notas documentan versiones anteriores del portfolio.

## Contenido

Fuentes: CV de noviembre de 2025, información facilitada por Pablo y repositorios públicos de https://github.com/4pablospena. LinkedIn no permitió lectura automatizada. No se infiere fecha de finalización en Fútbol Emotion ni finalización del grado.

## Retrato

Generado con la herramienta integrada imagegen a partir de la foto proporcionada. Original: `dist/assets/pablo-portrait.png`; versión optimizada: `dist/assets/pablo-portrait.webp`.

Prompt: Identity-preserving cinematic editorial hero portrait, landscape 1536x1024. Preserve the reference man's recognizable facial identity, facial proportions, brown eyes, short dark hair and short beard, front-facing gaze and neutral expression. Plain black crewneck, head and shoulders on the right half, face at approximately 65% width, ample negative space left. Dark slate #2b3342 studio backdrop, realistic skin and hair texture, subtle film grain, restrained warm rim lighting, soft directional light. Muted nearly monochrome palette. No text, graphics, logos, gold mask or props.

El retrato centra una escena de una sola pantalla. Cinco puntos muestran previews al pasar el puntero, enfocar o tocar; su llamada a la acción abre el capítulo en un diálogo nativo. El retrato tiene una respiración visual y desplazamiento sutil con el puntero, con pausa manual y respeto a movimiento reducido. No se simulan expresiones faciales. Correo, LinkedIn y proyectos enlazan a destinos reales.

## Diseño y experiencia

Revisión de septiembre de 2026: nombre completo en la cabecera y año centrado geométricamente, independientemente del ancho de sus vecinos. Tipografía actual: Sora (títulos) y Manrope (lectura), servidas por Google Fonts. Los paneles mantienen pestañas y controles visibles mientras solo el contenido de la ficha tiene scroll. Flechas, Home y End permiten navegar entre las pestañas. Una línea indica el progreso de lectura entre fichas.

Validación: cinco secciones, apertura/cierre, enlaces directos, selección por teclado, dimensiones del contenido y centrado del año en 1440×900, 390×844, 320×640, 768×1024 y 844×390. Se revisaron capturas en escritorio, móvil y horizontal. Sin errores JavaScript en esas comprobaciones. El panel sigue siendo no bloqueante para conservar acceso al retrato. La auditoría se limita a estas rutas y tamaños; no incluye dispositivos físicos ni una certificación de accesibilidad.

La navegación muestra únicamente puntos sobre el rostro. La preview está oculta hasta hover, foco o toque; permanece accesible al mover el puntero hacia ella y se cierra al salir o con Escape. El contenido se explora en fichas con pestañas y anterior/siguiente dentro de un panel no bloqueante: a la izquierda en escritorio y debajo de la cara en móvil. Los puntos permiten cambiar de sección mientras el panel está abierto. El retrato permanece visible y animado, con foco cálido que sigue el cursor usando coordenadas de la imagen y suavizado. La animación se omite con movimiento reducido. Tipografía: Space Grotesk para títulos y DM Sans para lectura. Se han retirado las flechas decorativas de navegación.

## Revisión de septiembre de 2026 (II): más personal, más vivo

Se retiran los puntos sobre la cara y el foco cálido de piel. La navegación pasa a un índice numerado en la barra inferior (scroll horizontal en móvil) que abre directamente cada panel.

- `dist/fx.js`: el retrato está fijo y sin efectos sobre la cara. Cursor propio con ratón: un punto lima que sigue al puntero y un anillo que lo acompaña con retardo, crece sobre enlaces y botones y se encoge al hacer clic. En táctil y con movimiento reducido se usa el cursor normal. También el reloj en vivo de la cabecera y la entrada con fundido de la portada.
- `dist/feeds.js`: paneles en vivo. «github» muestra contribuciones del último año (heatmap), días activos, racha más larga, lenguajes, actividad reciente y repositorios, a partir de la API pública de GitHub y de `github-contributions-api.jogruber.de`. Caché de 15 minutos en `localStorage`; si una fuente falla (por ejemplo, el límite de 60 peticiones/hora de la API sin autenticar) se reutilizan los últimos datos buenos, y si no hay ninguno se muestra un aviso y el enlace al perfil. La barra inferior muestra el último push.
- `dist/live.css`: capa visual final (JetBrains Mono para metadatos, lima `#c9f25c`, esquinas rectas, estilos de los paneles en vivo).

### Escritos (versión anterior)

El panel que enlazaba publicaciones de LinkedIn se ha sustituido por el blog propio descrito arriba. `dist/data/writing.json` queda como archivo histórico y ya no se consulta.

- `dist/style.css`: portada original y ajustes responsive.
- `dist/content.css`: capítulos editoriales en azul pizarra, papel y lima.
- `dist/scene.css` y `dist/scene.js`: escena del retrato, índice, diálogos, idioma y enrutado por hash. `main.js` conserva la implementación anterior y ya no se carga.
- `deckContent` organiza los resúmenes interactivos. Los capítulos largos quedan como alternativa sin JavaScript. Escape, cierre, historial y enlaces directos con hash están soportados. El foco vuelve al punto seleccionado.
- Sin librerías de animación. Movimiento reducido desactiva el movimiento del retrato. El contenido completo sigue visible sin JavaScript.
- Pestañas accesibles mediante flechas, Home y End; experiencias anteriores con elementos details nativos.
- Las descripciones de archivos y del firewall se contrastaron con los README públicos de los repositorios. Los diagramas son explicaciones conceptuales, no capturas de producto.

## Revisión de septiembre de 2026 (III): proyecto actual y móvil

Siarem aparece primero en proyectos, marcado «En desarrollo», con enlace al repositorio y descripción basada en su README público. La home incluye iconos accesibles de LinkedIn, correo, GitHub y X.

En pantallas de hasta 1000 px, la portada usa scroll natural, el retrato tiene un espacio propio y la navegación queda fija abajo. Los paneles aprovechan la altura disponible con scroll interior, texto de lectura de 15 px y controles táctiles de al menos 44 px en enlaces y pestañas. Se contempla el área segura inferior del dispositivo.

Comprobado en Chromium a 320×640, 390×844, 430×932, 768×1024, 844×390 y 1440×900: cinco secciones, cierre y cambio de idioma, sin desbordamiento horizontal ni errores JavaScript. Verificación con navegador emulado; pendiente de comprobación en dispositivos físicos.
