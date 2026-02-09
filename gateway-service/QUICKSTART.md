# 🚀 Instalación Rápida - Gateway Service

## ⚡ Inicio Rápido (5 minutos)

### 1️⃣ Copiar el proyecto

```bash
# Clonar repositorio
git clone https://github.com/14Fabyzz/Legacy_Pharmacy_Backend.git
cd Legacy_Pharmacy_Backend

# Copiar la carpeta gateway-service al repositorio
# (ya debe estar incluida si descargaste desde aquí)
```

### 2️⃣ Configurar JWT Secret

**IMPORTANTE**: El `JWT_SECRET` debe ser EL MISMO en todos los microservicios.

**Opción A: Variable de entorno (RECOMENDADO)**

```bash
export JWT_SECRET="legacypharmacy-super-secret-key-2024-minimum-256-bits-for-security"
```

**Opción B: Editar application.yml**

```yaml
# src/main/resources/application.yml
jwt:
  secret: tu-clave-secreta-muy-segura-cambiar-en-produccion-minimo-256-bits
```

### 3️⃣ Compilar y ejecutar

```bash
cd gateway-service

# Compilar
mvn clean install

# Ejecutar
mvn spring-boot:run
```

### 4️⃣ Verificar que funciona

```bash
# Health check
curl http://localhost:8080/actuator/health

# Respuesta esperada:
# {"status":"UP"}
```

---

## 📋 Checklist de Prerequisitos

Antes de ejecutar el Gateway, asegúrate de tener:

- [x] **Java 17+** instalado
  ```bash
  java -version
  ```

- [x] **Maven 3.8+** instalado
  ```bash
  mvn -version
  ```

- [x] **Microservicios corriendo**:
    - [ ] MS-Usuarios en puerto 8082
    - [ ] MS-Inventario en puerto 8081
    - [ ] MS-Ventas en puerto 8083
    - [ ] MS-Reportes en puerto 8084 (opcional)

---

## 🔧 Configuración de Microservicios

### Verificar que los microservicios estén corriendo

```bash
# Usuarios
curl http://localhost:8082/actuator/health

# Inventario
curl http://localhost:8081/actuator/health

# Ventas
curl http://localhost:8083/actuator/health

# Reportes
curl http://localhost:8084/actuator/health
```

### ⚠️ Si algún microservicio no responde

1. Ir al directorio del microservicio
2. Ejecutar: `mvn spring-boot:run`
3. Esperar a que inicie
4. Volver a intentar

---

## 🧪 Prueba Rápida

### 1. Login (sin autenticación)

```bash
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin",
<<<<<<< HEAD
    "password": "admin123"
=======
    "password": "your_password"
>>>>>>> 07cacaa80ccf220cb65c64c3522d1888c2bef274
  }'
```

**Respuesta esperada:**

```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "username": "admin",
  "rol": "ADMIN"
}
```

### 2. Consultar productos (con autenticación)

```bash
# Reemplaza TOKEN con el token recibido
TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."

curl -X GET http://localhost:8080/api/inventario/productos \
  -H "Authorization: Bearer $TOKEN"
```

**Respuesta esperada:**

```json
[
  {
    "id": 1,
    "nombre": "Acetaminofén 500mg",
    "precio": 5000.00
  }
]
```

---

## 📦 Estructura del Proyecto

```
gateway-service/
├── src/
│   └── main/
│       ├── java/com/legacy/pharmacy/gateway/
│       │   ├── GatewayServiceApplication.java    # ⭐ Main
│       │   ├── config/
│       │   │   ├── CorsConfig.java               # CORS
│       │   │   └── JwtUtil.java                  # JWT validator
│       │   ├── filter/
│       │   │   ├── AuthenticationFilter.java     # Auth filter
│       │   │   └── LoggingFilter.java            # Logs
│       │   └── controller/
│       │       └── FallbackController.java       # Fallback
│       └── resources/
│           ├── application.yml                   # ⚙️ Config principal
│           └── application.properties            # Alternativa
├── pom.xml                                       # 📦 Dependencies
├── README.md                                     # 📖 Documentación
├── TESTING.md                                    # 🧪 Guía de pruebas
└── ARCHITECTURE.md                               # 📐 Diagramas
```

---

## 🐛 Solución de Problemas

### Error: "Port 8080 already in use"

```bash
# Buscar proceso usando el puerto
lsof -i :8080

# Matar el proceso (reemplaza PID)
kill -9 PID

# O cambiar puerto en application.yml
server:
  port: 8090
```

### Error: "No se encontró el header de autorización"

- ✅ Verifica que envías el header: `Authorization: Bearer {token}`
- ✅ El token debe empezar con "Bearer "
- ✅ No debe tener espacios extra

### Error: "Service Unavailable"

- ✅ Verifica que el microservicio objetivo esté corriendo
- ✅ Revisa los puertos en `application.yml`
- ✅ Consulta logs: `tail -f logs/gateway.log`

### Error: "Token expirado o inválido"

- ✅ Verifica que JWT_SECRET sea el MISMO en Gateway y MS-Usuarios
- ✅ El token expira en 24 horas
- ✅ Haz login nuevamente para obtener un token nuevo

---

## 📊 Endpoints Disponibles

| Ruta                           | Microservicio | Autenticación |
|--------------------------------|---------------|---------------|
| `POST /api/auth/login`         | Usuarios      | ❌ No          |
| `POST /api/auth/registro`      | Usuarios      | ❌ No          |
| `GET /api/usuarios/**`         | Usuarios      | ✅ Sí          |
| `GET /api/inventario/**`       | Inventario    | ✅ Sí          |
| `GET /api/ventas/**`           | Ventas        | ✅ Sí          |
| `GET /api/reportes/**`         | Reportes      | ✅ Sí          |
| `GET /actuator/health`         | Gateway       | ❌ No          |
| `GET /actuator/gateway/routes` | Gateway       | ❌ No          |

---

## 🎯 Próximos Pasos

1. ✅ Gateway funcionando en puerto 8080
2. 📱 Conectar frontend Angular
3. 🧪 Ejecutar suite de pruebas (ver TESTING.md)
4. 📊 Configurar monitoreo
5. 🚀 Desplegar en producción

---

## 📞 Soporte

Si encuentras problemas:

1. Revisa logs: `logs/gateway.log`
2. Verifica health check: `http://localhost:8080/actuator/health`
3. Consulta TESTING.md para ejemplos de pruebas
4. Revisa ARCHITECTURE.md para entender el flujo

---

## ✅ Checklist Final

- [ ] Java 17+ instalado
- [ ] Maven compiló sin errores
- [ ] Gateway corriendo en :8080
- [ ] Microservicios corriendo
- [ ] JWT_SECRET configurado correctamente
- [ ] Health check responde OK
- [ ] Login funciona
- [ ] Consulta con token funciona

**¡Todo listo! 🎉 El Gateway está funcionando.**

Para más detalles, consulta:

- **README.md** - Documentación completa
- **TESTING.md** - Guía de pruebas con cURL y Postman
- **ARCHITECTURE.md** - Diagramas de arquitectura
