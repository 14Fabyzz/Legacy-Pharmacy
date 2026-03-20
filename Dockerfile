# Etapa 1: Construcción
FROM node:18-alpine as build-step
WORKDIR /app
COPY package.json package-lock.json ./
# Usamos legacy-peer-deps para evitar el error de ng2-charts
RUN npm install --legacy-peer-deps
COPY . .
RUN npm run build -- --configuration=production

# Etapa 2: Servidor Nginx
FROM nginx:stable-alpine
# Limpiamos rastro del "Welcome to nginx"
RUN rm -rf /usr/share/nginx/html/*
# Copiamos el build correcto: mi-dashboard
COPY --from=build-step /app/dist/mi-dashboard/browser /usr/share/nginx/html
# Corregimos el nombre del index si es necesario
RUN if [ -f /usr/share/nginx/html/index.csr.html ]; then mv /usr/share/nginx/html/index.csr.html /usr/share/nginx/html/index.html; fi
# Tu configuración de dominio regensaludpos.com
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]