# Etapa 1: Construcción
FROM node:18-alpine as build-step
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm install --legacy-peer-deps
COPY . .
RUN npm run build

# Etapa 2: Servidor Nginx
FROM nginx:stable-alpine

# 1. Limpiamos la carpeta de Nginx para que no queden rastros del "Welcome"
RUN rm -rf /usr/share/nginx/html/*

# 2. Copiamos tus archivos (mi-dashboard)
COPY --from=build-step /app/dist/mi-dashboard/browser /usr/share/nginx/html

# 3. TRUCO FINAL: Si Angular generó index.csr.html, lo renombramos a index.html
RUN if [ -f /usr/share/nginx/html/index.csr.html ]; then mv /usr/share/nginx/html/index.csr.html /usr/share/nginx/html/index.html; fi

# 4. Copiamos tu configuración de Nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]