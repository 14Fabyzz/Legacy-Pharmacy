# Etapa 1: Construcción
FROM node:18-alpine as build-step
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm install
COPY . .
RUN npm run build

# Etapa 2: Servidor Nginx
FROM nginx:1.17.1-alpine
# Copiamos desde la ruta exacta definida en tu angular.json
COPY --from=build-step /app/dist/mi-dashboard/browser /usr/share/nginx/html
# Copiamos tu configuración personalizada de Nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]