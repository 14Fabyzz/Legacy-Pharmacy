# Etapa 1: Construcción
FROM node:18-alpine as build-step
WORKDIR /app
COPY package.json ./
RUN npm install
COPY . .
RUN npm run build

# Etapa 2: Servidor Nginx
FROM nginx:1.17.1-alpine
# Copia el build de Angular a la carpeta de Nginx
COPY --from=build-step /app/dist/legacy-pharmacy /usr/share/nginx/html

COPY /nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80