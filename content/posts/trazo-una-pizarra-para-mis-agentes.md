---
title: "Trazo: una pizarra para trabajar con mis agentes de IA"
summary: "Qué estoy explorando con Trazo: un lienzo basado en Excalidraw que conecta mis dibujos con Codex, Cursor y Claude Code mediante MCP."
date: '2026-11-23'
category: trabajo
draft: false
---

En la [primera entrada de este blog](/blog/de-la-tienda-al-codigo/) conté que una de las cosas que más me interesa es cómo organizar el conocimiento para que pueda aprovecharlo otra persona o un agente. Con Build Your Agents estoy explorando esa idea a través de archivos de contexto y memoria. Con mi último proyecto, Trazo, la estoy llevando a un lienzo.

Me interesa poder dibujar una idea, revisarla con una IA y seguir trabajando sobre ella. Tener delante las partes de un sistema y sus relaciones ayuda a hacer preguntas que quizá no aparecen en una conversación escrita.

Por ejemplo, imagina que estás pensando cómo conectar una aplicación con un CRM. Puedes explicar el proceso en un mensaje largo. También puedes dibujar de dónde salen los datos, qué los transforma y dónde terminan. Al verlo, resulta más fácil señalar una dependencia que sobra o un paso que todavía no has resuelto.

Trazo es un espacio de dibujo basado en Excalidraw. Permite crear tableros, convertir contenido de Markdown y Mermaid al lienzo y conectar herramientas como Codex, Cursor o Claude Code mediante MCP. Los tableros se guardan en el navegador y pueden exportarse para conservar una copia o moverlos a otro equipo. El código y las instrucciones están en el [repositorio de Trazo](https://github.com/4pablospena/trazo).

Lo que más me interesa de esta última incorporación es la conexión con los agentes. MCP permite que una aplicación exponga herramientas que un agente puede utilizar. En este caso, abre una forma de trabajar con los dibujos desde el entorno en el que ya estoy desarrollando.

Eso también obliga a pensar en decisiones que quedan fuera del dibujo: cómo vincular el navegador, cómo autorizar la conexión o cómo comprobar que todo está funcionando. Son detalles que forman parte del producto. Si conectar una herramienta resulta confuso, cuesta llegar a utilizar lo que has construido.

Hay otra decisión de Trazo que conviene explicar: los tableros permanecen en el navegador y, de momento, no se sincronizan entre dispositivos. Para trasladarlos hay que exportarlos. Es una limitación concreta que prefiero dejar clara, porque guardar un dibujo localmente y tenerlo disponible desde cualquier sitio son comportamientos distintos.

Construir estas herramientas me está sirviendo para seguir una pregunta que ya apareció en mi primera entrada: ¿cómo consigo que el contexto que tengo yo también le sirva a un agente?

Un archivo puede recoger una decisión y sus motivos. Un diagrama puede mostrar cómo afecta esa decisión al resto del sistema. Quiero explorar cómo trabajar con ambos y poder revisarlos a medida que cambia el proyecto.

Trazo sale de esa curiosidad. Una pizarra abierta junto al código, con la posibilidad de incorporar a mis agentes al trabajo. Ahora me interesa probar en qué tareas ayuda de verdad y qué tengo que mejorar para que usarla resulte cómodo.
