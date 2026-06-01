# ALPR Workbench

Herramienta interna tipo *workbench* para probar un servicio de reconocimiento de placas vehiculares (ALPR). Es un frontend puro (React + Vite) que consume **directamente** la API ALPR vía `POST multipart/form-data` desde el browser. No tiene backend propio.

## Stack

- React 18 + Vite 5
- CSS puro con variables (sin Tailwind, sin UI libraries)
- Sin backend: llamada directa al servicio ALPR (requiere CORS habilitado en el servicio)

## Configuración

El endpoint se define en `.env.local`:

```
VITE_ALPR_ENDPOINT=https://tu-servicio.com/analyze
```

> Las variables `VITE_*` se inyectan en **build-time**. Si cambias el endpoint, debes reconstruir.

## Desarrollo

```bash
npm install
npm run dev      # http://localhost:5173
```

## Build de producción

```bash
npm run build    # genera ./dist (estáticos)
npm run preview  # sirve el build en http://localhost:4173
```

El contenido de `dist/` es servible desde cualquier hosting estático.

## Docker (producción)

Build multi-stage (Node para compilar, Nginx para servir):

```bash
# Con docker compose (lee VITE_ALPR_ENDPOINT del entorno o usa el default)
VITE_ALPR_ENDPOINT=https://tu-servicio.com/analyze docker compose up -d --build
# App disponible en http://localhost:8080
```

O directamente con Docker:

```bash
docker build --build-arg VITE_ALPR_ENDPOINT=https://tu-servicio.com/analyze -t alpr-workbench .
docker run -p 8080:80 alpr-workbench
```

## Formato de respuesta esperado

El parser (`src/utils/parseResponse.js`) espera un array `detections[]` con objetos de tipo `vehicle` y `plate`. Si tu servicio difiere, ese es el único archivo a adaptar; el resto de la app consume únicamente lo que devuelve ese util.

## Estructura

```
src/
  components/   DropZone, ResultPanel, RawJson, MetaCards, BboxCanvas
  hooks/        useAlpr.js
  utils/        drawBbox.js, parseResponse.js
  App.jsx  main.jsx  app.css
```
