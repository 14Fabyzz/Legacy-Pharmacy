# Documentación Técnica: Servicio de Inventario (Inventory Service)

> [!NOTE]
> **Versión del Documento:** 1.0  
> **Última Actualización:** 11 Febrero 2026  
> **Estado:** Activo  

## 1. Descripción General
El servicio de inventario gestiona el ciclo de vida de los productos, desde su creación hasta la venta o salida. Este documento detalla específicamente el módulo de **Movimientos de Inventario**, que permite rastrear el flujo de mercancía a través de dos vistas principales:
1.  **Kardex de Producto:** Historial detallado de un producto específico.
2.  **Bitácora Global:** Registro de los últimos movimientos de toda la farmacia.

---

## 2. Endpoints de Movimientos

### 2.1. Kardex de Producto (Historial Detallado)
Obtiene el historial completo de movimientos para un producto específico, calculando los saldos acumulados transacción por transacción.

| Método | URL | Descripción |
| :--- | :--- | :--- |
| `GET` | `/api/inventario/movimientos/producto/{id}` | Devuelve la lista de movimientos de un producto ordenados cronológicamente (descendente). |

#### Parámetros de Ruta (Path Parameters)
| Parámetro | Tipo | Requerido | Descripción |
| :--- | :--- | :--- | :--- |
| `id` | `Long` | Sí | ID único del producto a consultar. |

#### Ejemplo de Respuesta (Payload)
```json
[
  {
    "id": 105,
    "productoId": 12,
    "nombreProducto": "Amoxicilina 500mg",
    "tipoMovimiento": "ENTRADA",
    "cantidad": 50,
    "fecha": "2026-02-10T14:30:00",
    "saldoAnterior": 0,
    "saldoResultante": 50,
    "usuarioResponsable": "admin",
    "tipoReferencia": "COMPRA",
    "referenciaId": 1001,
    "detalle": "Compra de lote inicial"
  },
  {
    "id": 108,
    "productoId": 12,
    "nombreProducto": "Amoxicilina 500mg",
    "tipoMovimiento": "SALIDA",
    "cantidad": -5,
    "fecha": "2026-02-11T09:15:00",
    "saldoAnterior": 50,
    "saldoResultante": 45,
    "usuarioResponsable": "vendedor1",
    "tipoReferencia": "VENTA",
    "referenciaId": 5023,
    "detalle": "Venta en mostrador #1"
  }
]
```

---

### 2.2. Bitácora Global (Movimientos Recientes)
Endpoint utilizado para la vista general de auditoría. Muestra los últimos 50 movimientos registrados en el sistema, independientemente del producto.

| Método | URL | Descripción |
| :--- | :--- | :--- |
| `GET` | `/api/inventario/movimientos/recientes` | Lista los últimos 50 movimientos de toda la farmacia. |

#### Parámetros
*No requiere parámetros de entrada.*

#### Ejemplo de Respuesta (Payload)
```json
[
  {
    "id": 112,
    "productoId": 45,
    "nombreProducto": "Paracetamol 1g",
    "tipoMovimiento": "SALIDA",
    "cantidad": -10,
    "fecha": "2026-02-11T10:05:00",
    "saldoAnterior": 100,
    "saldoResultante": 90,
    "usuarioResponsable": "vendedor2",
    "detalle": "Venta rápida"
  },
  {
    "id": 111,
    "productoId": 12,
    "nombreProducto": "Ibuprofeno 400mg",
    "tipoMovimiento": "AJUSTE",
    "cantidad": -2,
    "fecha": "2026-02-11T10:00:00",
    "saldoAnterior": 50,
    "saldoResultante": 48,
    "usuarioResponsable": "admin",
    "detalle": "Ajuste por merma (producto dañado)"
  }
]
```

---

## 3. Reglas de Negocio y Consumo (Frontend)

> [!IMPORTANT]
> **Notas Críticas para la Implementación en Frontend**
>
> 1.  **Cálculo de Saldos:** El campo `saldo_resultante` es calculado **exclusivamente por el backend**. El frontend **NO** debe intentar recalcular saldos en el cliente para evitar inconsistencias visuales. Muestre el valor tal cual llega de la API.
>
> 2.  **Signo de la Cantidad:**
>     *   **Positivo (+):** Indica una ENTRADA al inventario (Compras, Devoluciones).
>     *   **Negativo (-):** Indica una SALIDA del inventario (Ventas, Mermas, Ajustes negativos).
>     *   *Tip:* Para mostrarlo en la UI, puede usar clases CSS condicionales basadas en el signo (e.g., `text-green-600` para `> 0`, `text-red-600` para `< 0`).
>
> 3.  **Productos Eliminados:** El campo `nombre_producto` viene poblado incluso si el producto original fue eliminado "lógicamente" o modificado. El historial preserva el nombre que tenía el producto (o el actual) para integridad histórica.
>
> 4.  **Paginación:** Actualmente el endpoint global (`/recientes`) está limitado a los **últimos 50 registros**. No soporta paginación por parámetros en esta versión (v1.0).

---

## 4. Estructura del Objeto Movimiento (Schema)

| Campo | Tipo | Nullable | Descripción |
| :--- | :--- | :--- | :--- |
| `id` | Integer | No | Identificador único del movimiento. |
| `productoId` | Integer | No | ID del producto asociado. |
| `nombreProducto` | String | No | Nombre comercial del producto. |
| `tipoMovimiento` | Enum | No | `ENTRADA`, `SALIDA`, `AJUSTE`. |
| `cantidad` | Integer | No | Cantidad movida (con signo). |
| `fecha` | DateTime | No | Fecha y hora exacta de la transacción (ISO 8601). |
| `saldoResultante` | Integer | No | Stock final después del movimiento. |
| `usuarioResponsable`| String | Sí | Username del usuario que realizó la acción. |
| `detalle` | String | Sí | Descripción o motivo del movimiento. |
