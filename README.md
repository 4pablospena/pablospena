# Pablo Suárez Peña

Portfolio editorial estático en español. Servir `dist/` con cualquier servidor HTTP. Sin dependencias de compilación.

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

### Escritos

LinkedIn no ofrece una API pública, así que los posts se añaden a mano en `dist/data/writing.json`. Se ordenan por fecha, del más reciente al más antiguo. Con la lista vacía, el panel invita a ver la actividad de LinkedIn.

```json
{
  "posts": [
    {
      "title": "Título del post",
      "date": "2026-09-20",
      "url": "https://www.linkedin.com/posts/...",
      "summary": "Una o dos frases.",
      "platform": "linkedin"
    }
  ]
}
```

- `dist/style.css`: portada original y ajustes responsive.
- `dist/content.css`: capítulos editoriales en azul pizarra, papel y lima.
- `dist/scene.css` y `dist/scene.js`: escena del retrato, índice, diálogos, idioma y enrutado por hash. `main.js` conserva la implementación anterior y ya no se carga.
- `deckContent` organiza los resúmenes interactivos. Los capítulos largos quedan como alternativa sin JavaScript. Escape, cierre, historial y enlaces directos con hash están soportados. El foco vuelve al punto seleccionado.
- Sin librerías de animación. Movimiento reducido desactiva el movimiento del retrato. El contenido completo sigue visible sin JavaScript.
- Pestañas accesibles mediante flechas, Home y End; experiencias anteriores con elementos details nativos.
- Las descripciones de archivos y del firewall se contrastaron con los README públicos de los repositorios. Los diagramas son explicaciones conceptuales, no capturas de producto.
