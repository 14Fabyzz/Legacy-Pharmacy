# 🧪 Guía de Pruebas - Legacy Pharmacy Gateway

## 📋 Tabla de Contenidos

1. [Configuración Inicial](#configuración-inicial)
2. [Pruebas de Autenticación](#pruebas-de-autenticación)
3. [Pruebas de Inventario](#pruebas-de-inventario)
4. [Pruebas de Ventas](#pruebas-de-ventas)
5. [Pruebas de Usuarios](#pruebas-de-usuarios)
6. [Pruebas de Circuit Breaker](#pruebas-de-circuit-breaker)

---

## ⚙️ Configuración Inicial

### Variables de Entorno (Postman)

Crear una colección en Postman y definir estas variables:

```json
{
  "gateway_url": "http://localhost:8080",
  "token": ""
}
```

### Prerrequisitos

✅ Gateway corriendo en puerto 8080
✅ Microservicio de Usuarios corriendo en puerto 8082
✅ Microservicio de Inventario corriendo en puerto 8081
✅ Microservicio de Ventas corriendo en puerto 8083

---

## 🔐 Pruebas de Autenticación

### 1. Login Exitoso

**Endpoint**: `POST /api/auth/login`

**cURL**:

```bash
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin",
    "password": "admin123"
  }'
```

**Respuesta Esperada** (200 OK):

```json
{
<<<<<<< HEAD
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJhZG1pbiIsInVzZXJJZCI6MSwicm9sIjoiQURNSU4iLCJpYXQiOjE3MDI...",
=======
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
>>>>>>> 07cacaa80ccf220cb65c64c3522d1888c2bef274
  "username": "admin",
  "rol": "ADMIN",
  "userId": 1
}
```

**Postman**:

1. Crear request POST
2. URL: `{{gateway_url}}/api/auth/login`
3. Body → raw → JSON
4. Copiar el JSON del request
5. En Tests, agregar:

```javascript
pm.test("Login exitoso", function () {
    pm.response.to.have.status(200);
    var jsonData = pm.response.json();
    pm.environment.set("token", jsonData.token);
});
```

### 2. Login Fallido - Credenciales Incorrectas

**cURL**:

```bash
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin",
    "password": "wrongpassword"
  }'
```

**Respuesta Esperada** (401 Unauthorized):

```json
{
  "error": "Credenciales inválidas"
}
```

---

## 📦 Pruebas de Inventario

### 3. Listar Productos (Con Autenticación)

**Endpoint**: `GET /api/inventario/productos`

**cURL**:

```bash
TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."

curl -X GET http://localhost:8080/api/inventario/productos \
  -H "Authorization: Bearer $TOKEN"
```

**Respuesta Esperada** (200 OK):

```json
[
  {
    "id": 1,
    "nombre": "Acetaminofén 500mg",
    "precio": 5000.00,
    "stock": 100,
    "categoria": "Analgésicos"
  }
]
```

**Postman**:

1. GET → `{{gateway_url}}/api/inventario/productos`
2. Authorization → Type: Bearer Token
3. Token: `{{token}}`

### 4. Crear Producto

**Endpoint**: `POST /api/inventario/productos`

**cURL**:

```bash
curl -X POST http://localhost:8080/api/inventario/productos \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "nombre": "Ibuprofeno 400mg",
    "descripcion": "Antiinflamatorio no esteroideo",
    "precio": 8000.00,
    "categoriaId": 1,
    "laboratorioId": 2,
    "registroInvima": "INVIMA2024M-001234",
    "requiereRefrigeracion": false,
    "esControlado": false
  }'
```

### 5. Entrada de Mercancía

**Endpoint**: `POST /api/inventario/entrada`

**cURL**:

```bash
curl -X POST http://localhost:8080/api/inventario/entrada \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "productoId": 1,
    "cantidad": 50,
    "precioCompra": 3000.00,
    "lote": "LOTE-2024-001",
    "fechaVencimiento": "2025-12-31",
    "sucursalId": 1,
    "responsableId": 1
  }'
```

---

## 💰 Pruebas de Ventas

### 6. Crear Venta

**Endpoint**: `POST /api/ventas`

**cURL**:

```bash
curl -X POST http://localhost:8080/api/ventas \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "clienteId": 5,
    "vendedorId": 1,
    "sucursalId": 1,
    "metodoPago": "EFECTIVO",
    "items": [
      {
        "productoId": 1,
        "cantidad": 2,
        "precio": 5000.00
      },
      {
        "productoId": 3,
        "cantidad": 1,
        "precio": 12000.00
      }
    ]
  }'
```

**Respuesta Esperada**:

```json
{
  "ventaId": 123,
  "folio": "VTA-2024-000123",
  "total": 22000.00,
  "fecha": "2024-12-16T10:30:00",
  "estado": "COMPLETADA"
}
```

### 7. Consultar Venta por ID

**cURL**:

```bash
curl -X GET http://localhost:8080/api/ventas/123 \
  -H "Authorization: Bearer $TOKEN"
```

---

## 👥 Pruebas de Usuarios

### 8. Listar Usuarios (Solo Admin)

**Endpoint**: `GET /api/usuarios`

**cURL**:

```bash
curl -X GET http://localhost:8080/api/usuarios \
  -H "Authorization: Bearer $TOKEN"
```

### 9. Obtener Usuario por ID

**cURL**:

```bash
curl -X GET http://localhost:8080/api/usuarios/1 \
  -H "Authorization: Bearer $TOKEN"
```

### 10. Actualizar Usuario

**cURL**:

```bash
curl -X PUT http://localhost:8080/api/usuarios/5 \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "nombre": "Juan Actualizado",
    "email": "juan.actualizado@legacy.com",
    "telefono": "3001234567"
  }'
```

---

## 🚨 Pruebas de Seguridad

### 11. Acceso sin Token (Debe Fallar)

**cURL**:

```bash
curl -X GET http://localhost:8080/api/inventario/productos
```

**Respuesta Esperada** (401 Unauthorized):

```json
{
  "error": "Unauthorized",
  "message": "No se encontró el header de autorización",
  "timestamp": "2024-12-16T10:30:00"
}
```

### 12. Token Inválido (Debe Fallar)

**cURL**:

```bash
curl -X GET http://localhost:8080/api/inventario/productos \
  -H "Authorization: Bearer token-invalido-12345"
```

**Respuesta Esperada** (401 Unauthorized):

```json
{
  "error": "Unauthorized",
  "message": "Token expirado o inválido",
  "timestamp": "2024-12-16T10:30:00"
}
```

### 13. Token sin "Bearer" (Debe Fallar)

**cURL**:

```bash
curl -X GET http://localhost:8080/api/inventario/productos \
  -H "Authorization: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

**Respuesta Esperada** (401 Unauthorized):

```json
{
  "error": "Unauthorized",
  "message": "Token inválido - debe empezar con 'Bearer '",
  "timestamp": "2024-12-16T10:30:00"
}
```

---

## ⚡ Pruebas de Circuit Breaker

### 14. Simular Microservicio Caído

**Pasos**:

1. Detener el microservicio de inventario (puerto 8081)
2. Intentar acceder a productos:

**cURL**:

```bash
curl -X GET http://localhost:8080/api/inventario/productos \
  -H "Authorization: Bearer $TOKEN"
```

**Respuesta Esperada** (503 Service Unavailable):

```json
{
  "timestamp": "2024-12-16T10:30:00",
  "status": 503,
  "error": "Service Unavailable",
  "message": "El servicio solicitado no está disponible temporalmente. Por favor, intente más tarde.",
  "suggestion": "Si el problema persiste, contacte al administrador del sistema."
}
```

---

## 📊 Pruebas de Monitoreo

### 15. Health Check

**cURL**:

```bash
curl -X GET http://localhost:8080/actuator/health
```

**Respuesta Esperada**:

```json
{
  "status": "UP"
}
```

### 16. Ver Rutas Configuradas

**cURL**:

```bash
curl -X GET http://localhost:8080/actuator/gateway/routes
```

---

## 📝 Colección Postman Completa

### Importar esta colección JSON:

```json
{
  "info": {
    "name": "Legacy Pharmacy Gateway",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "variable": [
    {
      "key": "gateway_url",
      "value": "http://localhost:8080"
    },
    {
      "key": "token",
      "value": ""
    }
  ],
  "item": [
    {
      "name": "Auth",
      "item": [
        {
          "name": "Login",
          "event": [
            {
              "listen": "test",
              "script": {
                "exec": [
                  "pm.test(\"Login exitoso\", function () {",
                  "    pm.response.to.have.status(200);",
                  "    var jsonData = pm.response.json();",
                  "    pm.environment.set(\"token\", jsonData.token);",
                  "});"
                ]
              }
            }
          ],
          "request": {
            "method": "POST",
            "header": [],
            "body": {
              "mode": "raw",
              "raw": "{\n    \"username\": \"admin\",\n    \"password\": \"admin123\"\n}",
              "options": {
                "raw": {
                  "language": "json"
                }
              }
            },
            "url": {
              "raw": "{{gateway_url}}/api/auth/login",
              "host": ["{{gateway_url}}"],
              "path": ["api", "auth", "login"]
            }
          }
        }
      ]
    },
    {
      "name": "Inventario",
      "item": [
        {
          "name": "Listar Productos",
          "request": {
            "auth": {
              "type": "bearer",
              "bearer": [
                {
                  "key": "token",
                  "value": "{{token}}",
                  "type": "string"
                }
              ]
            },
            "method": "GET",
            "url": {
              "raw": "{{gateway_url}}/api/inventario/productos",
              "host": ["{{gateway_url}}"],
              "path": ["api", "inventario", "productos"]
            }
          }
        }
      ]
    }
  ]
}
```

---

## ✅ Checklist de Pruebas

- [ ] Login exitoso
- [ ] Login fallido
- [ ] Listar productos con token
- [ ] Listar productos sin token (debe fallar)
- [ ] Crear producto
- [ ] Crear venta
- [ ] Consultar usuario
- [ ] Circuit breaker (servicio caído)
- [ ] Health check
- [ ] Ver rutas del gateway

---

## 🎯 Resultados Esperados

| Prueba         | Código Esperado  | Tiempo Respuesta |
|----------------|------------------|------------------|
| Login          | 200 OK           | < 500ms          |
| GET productos  | 200 OK           | < 300ms          |
| POST producto  | 201 Created      | < 500ms          |
| Sin token      | 401 Unauthorized | < 100ms          |
| Token inválido | 401 Unauthorized | < 100ms          |
| Servicio caído | 503 Unavailable  | < 100ms          |

---

Para más información, consulta el README principal del proyecto.
