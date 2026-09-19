# Pablo Suárez Peña

Portfolio editorial estático en español. Servir `dist/` con cualquier servidor HTTP. Sin dependencias de compilación.

## Contenido

Fuentes: CV de noviembre de 2025, información facilitada por Pablo y repositorios públicos de https://github.com/4pablospena. LinkedIn no permitió lectura automatizada. No se infiere fecha de finalización en Fútbol Emotion ni finalización del grado.

## Retrato

Generado con la herramienta integrada imagegen a partir de la foto proporcionada. Original: `dist/assets/pablo-portrait.png`; versión optimizada: `dist/assets/pablo-portrait.webp`.

Prompt: Identity-preserving cinematic editorial hero portrait, landscape 1536x1024. Preserve the reference man's recognizable facial identity, facial proportions, brown eyes, short dark hair and short beard, front-facing gaze and neutral expression. Plain black crewneck, head and shoulders on the right half, face at approximately 65% width, ample negative space left. Dark slate #2b3342 studio backdrop, realistic skin and hair texture, subtle film grain, restrained warm rim lighting, soft directional light. Muted nearly monochrome palette. No text, graphics, logos, gold mask or props.

El retrato centra una escena de una sola pantalla. Cinco puntos muestran previews al pasar el puntero, enfocar o tocar; su llamada a la acción abre el capítulo en un diálogo nativo. El retrato tiene una respiración visual y desplazamiento sutil con el puntero, con pausa manual y respeto a movimiento reducido. No se simulan expresiones faciales. Correo, LinkedIn y proyectos enlazan a destinos reales.

## Diseño y experiencia

La navegación muestra únicamente puntos sobre el rostro. La preview está oculta hasta hover, foco o toque; permanece accesible al mover el puntero hacia ella y se cierra al salir o con Escape. El contenido se explora en fichas con pestañas y anterior/siguiente dentro de un panel no bloqueante: a la izquierda en escritorio y debajo de la cara en móvil. Los puntos permiten cambiar de sección mientras el panel está abierto. El retrato permanece visible y animado, con foco cálido que sigue el cursor usando coordenadas de la imagen y suavizado. La animación se omite con movimiento reducido. Tipografía: Space Grotesk para títulos y DM Sans para lectura. Se han retirado las flechas decorativas de navegación.

- `dist/style.css`: portada original y ajustes responsive.
- `dist/content.css`: capítulos editoriales en azul pizarra, papel y lima.
- `dist/scene.css` y `dist/scene.js`: mapa del retrato, previews, movimiento y diálogos. `main.js` conserva la implementación anterior y ya no se carga.
- `deckContent` organiza los resúmenes interactivos. Los capítulos largos quedan como alternativa sin JavaScript. Escape, cierre, historial y enlaces directos con hash están soportados. El foco vuelve al punto seleccionado.
- Sin librerías de animación. Movimiento reducido desactiva el movimiento del retrato. El contenido completo sigue visible sin JavaScript.
- Pestañas accesibles mediante flechas, Home y End; experiencias anteriores con elementos details nativos.
- Las descripciones de archivos y del firewall se contrastaron con los README públicos de los repositorios. Los diagramas son explicaciones conceptuales, no capturas de producto.
