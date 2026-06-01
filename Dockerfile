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

# ---------- Stage 2: runtime ----------
FROM nginx:1.27-alpine AS runtime


RUN chown -R nginx:nginx /usr/share/nginx/html && \
chown -R nginx:nginx /var/cache/nginx && \
chown -R nginx:nginx /var/log/nginx && \
touch /var/run/nginx.pid && \
chown nginx:nginx /var/run/nginx.pid

# Config de nginx con fallback SPA y headers de cache.
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copia los estáticos generados por Vite.
COPY --from=build /app/dist /usr/share/nginx/html

# Limita worker processes explícitamente (evita que nginx detecte
# los cores del host y lance más workers de los necesarios)
RUN sed -i 's/worker_processes  auto/worker_processes 1/' /etc/nginx/nginx.conf

USER nginx

EXPOSE 80

# Healthcheck simple contra el index.
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget -q --spider http://localhost/ || exit 1

CMD ["nginx", "-g", "daemon off;"]
