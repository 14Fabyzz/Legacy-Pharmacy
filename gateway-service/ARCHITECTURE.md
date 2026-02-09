# Diagrama de Arquitectura - Legacy Pharmacy

## Arquitectura General del Sistema

```mermaid
graph TB
    subgraph "Frontend Layer"
        Angular[Angular App<br/>localhost:4200]
    end

    subgraph "API Gateway Layer - Puerto 8080"
        Gateway[API Gateway<br/>Spring Cloud Gateway]
        Auth[Authentication Filter<br/>JWT Validation]
        Logger[Logging Filter]
        CB[Circuit Breaker]
        CORS[CORS Filter]
        
        Gateway --> Auth
        Gateway --> Logger
        Gateway --> CB
        Gateway --> CORS
    end

    subgraph "Microservices Layer"
        subgraph "MS Usuarios - 8082"
            UsersAPI[REST API]
            UsersDB[(MySQL<br/>legacy_pharmacy_usuarios)]
            UsersAPI --> UsersDB
        end

        subgraph "MS Inventario - 8081"
            InvAPI[REST API]
            InvDB[(MySQL<br/>legacy03)]
            InvAPI --> InvDB
        end

        subgraph "MS Ventas - 8083"
            VentasAPI[REST API]
            VentasDB[(PostgreSQL<br/>legacy_pharmacy_ventas)]
            VentasAPI --> VentasDB
        end

        subgraph "MS Reportes - 8084"
            ReportAPI[REST API]
            ReportAPI -.consulta.-> InvDB
            ReportAPI -.consulta.-> VentasDB
        end
    end

    Angular -->|HTTP Requests| Gateway
    Gateway -->|/api/usuarios/**| UsersAPI
    Gateway -->|/api/inventario/**| InvAPI
    Gateway -->|/api/ventas/**| VentasAPI
    Gateway -->|/api/reportes/**| ReportAPI

    style Gateway fill:#4CAF50,stroke:#2E7D32,stroke-width:3px,color:#fff
    style Angular fill:#E91E63,stroke:#C2185B,stroke-width:2px,color:#fff
    style UsersDB fill:#FF9800,stroke:#F57C00,stroke-width:2px,color:#fff
    style InvDB fill:#FF9800,stroke:#F57C00,stroke-width:2px,color:#fff
    style VentasDB fill:#2196F3,stroke:#1976D2,stroke-width:2px,color:#fff
```

## Flujo de Autenticación

```mermaid
sequenceDiagram
    participant U as Usuario
    participant A as Angular
    participant G as Gateway:8080
    participant M as MS-Usuarios:8082
    participant D as MySQL

    U->>A: Ingresa credenciales
    A->>G: POST /api/auth/login
    G->>M: POST /api/v1/usuarios/login
    M->>D: SELECT * FROM usuarios
    D-->>M: Datos usuario
    M->>M: Valida password (BCrypt)
    M->>M: Genera JWT Token
    M-->>G: {token, username, rol}
    G-->>A: {token, username, rol}
    A->>A: Guarda token en localStorage
    A-->>U: Redirige a dashboard
    
    Note over A,G: Siguientes peticiones incluyen token
    
    U->>A: Solicita productos
    A->>G: GET /api/inventario/productos<br/>Authorization: Bearer {token}
    G->>G: Valida JWT con JwtUtil
    G->>G: Añade headers:<br/>X-User-Id, X-Username, X-User-Role
    G->>M: GET /api/v1/inventario/productos<br/>+ headers de usuario
    M-->>G: Lista de productos
    G-->>A: Lista de productos
    A-->>U: Muestra productos
```

## Flujo de Venta

```mermaid
sequenceDiagram
    participant V as Vendedor
    participant A as Angular
    participant G as Gateway
    participant MS_V as MS-Ventas
    participant MS_I as MS-Inventario
    participant PG as PostgreSQL
    participant MY as MySQL

    V->>A: Escanea productos
    A->>G: GET /api/inventario/productos/{id}
    G->>MS_I: GET /api/v1/inventario/productos/{id}
    MS_I->>MY: SELECT producto, stock
    MY-->>MS_I: Datos producto
    MS_I-->>G: {producto, stock disponible}
    G-->>A: {producto, stock}
    A-->>V: Muestra precio y stock

    V->>A: Confirma venta
    A->>G: POST /api/ventas<br/>{items:[...]}
    G->>MS_V: POST /api/v1/ventas
    MS_V->>MS_I: Verifica stock disponible
    MS_I->>MY: SELECT stock FROM lotes
    MY-->>MS_I: Stock disponible
    MS_I-->>MS_V: OK - Stock suficiente
    
    MS_V->>PG: BEGIN TRANSACTION
    MS_V->>PG: INSERT INTO ventas
    MS_V->>PG: INSERT INTO detalle_venta
    MS_V->>MS_I: POST /descuenta-stock<br/>{productoId, cantidad}
    MS_I->>MY: UPDATE lotes SET cantidad
    MY-->>MS_I: OK
    MS_I-->>MS_V: Stock actualizado
    MS_V->>PG: COMMIT
    MS_V-->>G: {ventaId, folio, total}
    G-->>A: Venta exitosa
    A-->>V: Imprime factura
```

## Rutas del Gateway

```mermaid
graph LR
    subgraph "Rutas Públicas"
        LOGIN[/api/auth/login]
        REGISTRO[/api/auth/registro]
    end

    subgraph "Rutas Protegidas"
        subgraph "Usuarios"
            U1[/api/usuarios/**]
        end
        
        subgraph "Inventario"
            I1[/api/inventario/productos/**]
            I2[/api/inventario/lotes/**]
            I3[/api/inventario/categorias/**]
            I4[/api/inventario/entrada]
        end
        
        subgraph "Ventas"
            V1[/api/ventas/**]
            V2[/api/facturas/**]
        end
        
        subgraph "Reportes"
            R1[/api/reportes/ventas/**]
            R2[/api/reportes/inventario/**]
            R3[/api/reportes/financieros/**]
        end
    end

    Gateway{Gateway<br/>:8080}
    
    LOGIN --> Gateway
    REGISTRO --> Gateway
    U1 --> Gateway
    I1 --> Gateway
    I2 --> Gateway
    I3 --> Gateway
    I4 --> Gateway
    V1 --> Gateway
    V2 --> Gateway
    R1 --> Gateway
    R2 --> Gateway
    R3 --> Gateway

    Gateway -->|:8082| MS_Users[MS-Usuarios]
    Gateway -->|:8081| MS_Inv[MS-Inventario]
    Gateway -->|:8083| MS_Ventas[MS-Ventas]
    Gateway -->|:8084| MS_Report[MS-Reportes]

    style LOGIN fill:#81C784,stroke:#4CAF50
    style REGISTRO fill:#81C784,stroke:#4CAF50
    style U1 fill:#FFB74D,stroke:#FF9800
    style I1 fill:#FFB74D,stroke:#FF9800
    style V1 fill:#FFB74D,stroke:#FF9800
    style R1 fill:#FFB74D,stroke:#FF9800
    style Gateway fill:#E57373,stroke:#F44336,stroke-width:3px
```

## Circuit Breaker

```mermaid
stateDiagram-v2
    [*] --> Closed: Sistema normal
    
    Closed --> Open: 50% de fallos<br/>en 10 llamadas
    Open --> HalfOpen: Espera 30s
    HalfOpen --> Closed: 3 llamadas exitosas
    HalfOpen --> Open: Fallo detectado
    
    Closed: 🟢 CLOSED<br/>Peticiones normales<br/>al microservicio
    
    Open: 🔴 OPEN<br/>Retorna fallback<br/>inmediatamente
    
    HalfOpen: 🟡 HALF-OPEN<br/>Prueba 3 llamadas<br/>para recuperar
    
    note right of Open
        Fallback Response:
        503 Service Unavailable
        "Servicio temporalmente
        no disponible"
    end note
```

## Componentes del Gateway

```mermaid
graph TD
    Request[HTTP Request] --> LoggingFilter
    LoggingFilter[Logging Filter<br/>Auditoría] --> CORS_Filter
    CORS_Filter[CORS Filter<br/>Permite orígenes] --> Route_Check
    
    Route_Check{¿Ruta pública?}
    Route_Check -->|Sí| Public_Routes
    Route_Check -->|No| AuthFilter
    
    Public_Routes[Login/Registro] --> Forward
    
    AuthFilter[Authentication Filter<br/>Valida JWT] --> JWT_Valid{¿JWT válido?}
    JWT_Valid -->|No| Return_401[401 Unauthorized]
    JWT_Valid -->|Sí| Add_Headers
    
    Add_Headers[Añade Headers:<br/>X-User-Id<br/>X-Username<br/>X-User-Role] --> Circuit
    
    Circuit[Circuit Breaker] --> Service_OK{¿Servicio OK?}
    Service_OK -->|Sí| Forward[Reenvía a MS]
    Service_OK -->|No| Fallback[503 Fallback]
    
    Forward --> MS[Microservicio]
    MS --> Response[HTTP Response]
    
    Return_401 --> Response
    Fallback --> Response
    
    Response --> LogResponse[Log respuesta] --> Client[Cliente]

    style Request fill:#E3F2FD
    style AuthFilter fill:#FFF9C4
    style Circuit fill:#FFCCBC
    style Response fill:#C8E6C9
    style Return_401 fill:#FFCDD2
    style Fallback fill:#FFCDD2
```

---

## Tecnologías por Capa

| Capa                | Tecnología               | Versión                  |
|---------------------|--------------------------|--------------------------|
| **Frontend**        | Angular                  | 17+                      |
| **Gateway**         | Spring Cloud Gateway     | 2023.0.0                 |
| **Autenticación**   | JWT (jjwt)               | 0.12.3                   |
| **Circuit Breaker** | Resilience4j             | Incluido en Spring Cloud |
| **MS-Usuarios**     | Spring Boot + MySQL      | 3.2.0                    |
| **MS-Inventario**   | Spring Boot + MySQL      | 3.2.0                    |
| **MS-Ventas**       | Spring Boot + PostgreSQL | 3.2.0                    |
| **MS-Reportes**     | Spring Boot              | 3.2.0                    |
