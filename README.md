# Pablo Suárez Peña

Portfolio editorial estático en español. Servir `dist/` con cualquier servidor HTTP. Sin dependencias de compilación.

## Contenido

Fuentes: CV de noviembre de 2025, información facilitada por Pablo y repositorios públicos de https://github.com/4pablospena. LinkedIn no permitió lectura automatizada. No se infiere fecha de finalización en Fútbol Emotion ni finalización del grado.

## Retrato

Generado con la herramienta integrada imagegen a partir de la foto proporcionada. Original: `dist/assets/pablo-portrait.png`; versión optimizada: `dist/assets/pablo-portrait.webp`.

Prompt: Identity-preserving cinematic editorial hero portrait, landscape 1536x1024. Preserve the reference man's recognizable facial identity, facial proportions, brown eyes, short dark hair and short beard, front-facing gaze and neutral expression. Plain black crewneck, head and shoulders on the right half, face at approximately 65% width, ample negative space left. Dark slate #2b3342 studio backdrop, realistic skin and hair texture, subtle film grain, restrained warm rim lighting, soft directional light. Muted nearly monochrome palette. No text, graphics, logos, gold mask or props.

El foco del cursor revela una versión cálida del mismo retrato mediante una máscara CSS. Solo dispositivos con puntero fino; sin autoplay. El bucle se detiene al converger. Respeta movimiento reducido. Correo, LinkedIn y proyectos enlazan a destinos reales.

## Diseño y experiencia

- `dist/style.css`: portada original y ajustes responsive.
- `dist/content.css`: capítulos editoriales en azul pizarra, papel y lima.
- `dist/main.js`: foco del retrato, entradas con IntersectionObserver, progreso de lectura, navegación activa, desplazamiento de la banda y explorador de siete archivos.
- Sin librerías de animación ni bucles continuos de scroll. Un requestAnimationFrame agrupa eventos; las entradas se observan una sola vez.
- Movimiento reducido desactiva transiciones, entradas y desplazamientos. El contenido es visible sin JavaScript.
- Pestañas accesibles mediante flechas, Home y End; experiencias anteriores con elementos details nativos.
- Las descripciones de archivos y del firewall se contrastaron con los README públicos de los repositorios. Los diagramas son explicaciones conceptuales, no capturas de producto.
