# ---------- Stage 1: build ----------
FROM node:20-alpine AS build

WORKDIR /app

# El endpoint de Vite se inyecta en build-time (las variables VITE_* se "hornean" en el bundle).
ARG VITE_ALPR_ENDPOINT
ENV VITE_ALPR_ENDPOINT=${VITE_ALPR_ENDPOINT}

# Instala dependencias con cache eficiente.
COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# ---------- Stage 2: publisher ----------
# Imagen mínima cuya única función es publicar /dist en un volumen
# compartido (montado en /shared). Nginx público consume ese volumen.
FROM alpine:3.20 AS publisher

COPY --from=build /app/dist /dist

# Sincroniza estáticos al volumen compartido y termina exitosamente.
CMD ["sh", "-c", "rm -rf /shared/* && cp -a /dist/. /shared/ && echo 'dist publicado:' && ls -la /shared"]
