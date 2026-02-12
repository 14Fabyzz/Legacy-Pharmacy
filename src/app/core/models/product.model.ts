export interface Categoria {
    id: number;
    nombre: string;
    descripcion?: string;
    activa: boolean;
}

export interface Laboratorio {
    id: number;
    nombre: string;
    pais?: string;
    telefono?: string;
    email?: string;
    activo: boolean;
}

export interface PrincipioActivo {
    id: number;
    nombre: string;
    descripcion?: string;
    activo: boolean;
}

// Para LISTAR (GET): El backend devuelve objetos anidados
// Mantenemos snake_case si el backend antiguo lo usaba, o actualizamos si es necesario.
// El prompt no pidió explícitamente cambiar "Producto" (detailed), pero sí "ProductoRequest".
// Asumiremos que "Producto" detallado sigue llegando como antes por seguridad, 
// o si vemos errores de mapeo lo corregiremos.
export interface Producto {
    id: number;
    codigo_interno: string;
    codigo_barras: string;
    nombre_comercial: string;
    concentracion: string;
    presentacion: string;

    // Objetos anidados
    laboratorio: Laboratorio;
    categoria: Categoria;
    principioActivo: PrincipioActivo;

    // Inputs: Campos que el frontend envía al backend
    precio_compra_referencia: number;  // Costo de compra (obligatorio)
    porcentaje_ganancia: number;       // Margen de ganancia % (obligatorio)
    iva_porcentaje: number;            // IVA % (obligatorio)

    // Outputs: Precios calculados automáticamente por el backend
    precio_venta_base?: number;        // Calculado: precioCompra * (1 + margen/100)
    precio_venta_total?: number;       // Calculado: precioVentaBase * (1 + IVA/100)
    precio_venta_unidad?: number;      // Calculado: precioVentaTotal / unidadesPorCaja
    precio_venta_blister?: number;     // Calculado: precioVentaUnidad * unidadesPorBlister

    stock_minimo: number;
    stock_actual: number;

    tipo: 'TANGIBLE' | 'SERVICIO'; // Default 'TANGIBLE'
    unidadesPorBlister?: number;   // Nuevo campo informativo

    // Campos Fraccionamiento
    unidadesPorCaja: number;
    esFraccionable: boolean;

    es_controlado: boolean;
    refrigerado: boolean;
    estado: string;

    proximo_vencimiento?: string | Date;
    imagenUrl?: string;
    registro_invima?: string;

    // Helper para UI
    daysUntilExpiry?: number;
}

// Para CREAR/EDITAR (POST/PUT): El backend espera DTO Java (CamelCase)
export interface ProductoRequest {
    codigoInterno: string;
    codigoBarras: string;
    nombreComercial: string;
    concentracion: string;
    presentacion: string;

    laboratorioId: number;
    categoriaId: number;
    principioActivoId: number;

    // Inputs obligatorios: El backend calcula los precios a partir de estos valores
    precioCompraReferencia: number;  // Costo de compra
    porcentajeGanancia: number;      // Margen de ganancia %
    ivaPorcentaje: number;           // IVA %

    stockMinimo: number;
    stockActual: number;

    tipo: 'TANGIBLE' | 'SERVICIO';
    unidadesPorBlister?: number;

    // Campos Fraccionamiento
    unidadesPorCaja: number;
    esFraccionable: boolean;

    esControlado: boolean;
    refrigerado: boolean;
    estado: string; // 'ACTIVO' | 'INACTIVO'

    proximoVencimiento?: string | Date;
    imagenUrl?: string;
    registroInvima?: string;
}

// Interfaz optimizada para el listado (Vista de Tarjetas / Dashboard)
// Interfaz optimizada para el listado (Vista de Tarjetas / Dashboard)
// Basada en v_stock_productos (JSON Backend)
export interface ProductoCard {
    id: number;
    nombreComercial: string;
    presentacion: string;
    laboratorio: string;
    categoria: string;

    // Precios (PrecioVentaTotal es el más importante)
    precioVentaTotal?: number;       // PVP Final con IVA (opcional por compatibilidad)
    precioVentaBlister?: number;     // Precio secundario si aplica
    ivaPorcentaje: number;           // 0 = Exento, >0 = Gravado

    // Stock
    nivelStock: string;              // "CRITICO", "BAJO", "OPTIMO", "SOBRESTOCK"
    stockTotal: number;

    // Venta Fraccionada
    esFraccionable: boolean;

    // Alertas de Seguridad
    refrigerado: boolean;
    esControlado: boolean;

    // Vencimiento
    proximoVencimiento?: string;

    // Identificadores (Nuevos para Búsqueda)
    codigoBarras?: string;
    codigoInterno?: string;
}

export interface Lote {
    id: number;
    numeroLote: string;
    fechaVencimiento: string | Date;
    cantidadActual: number;
    costoCompra: number;
}

// Respuesta del endpoint /api/inventario/lotes/disponibles/{id}
export interface DetalleProducto {
    codigoInterno: string;
    nombreComercial: string;
    porcentajeGanancia: number;
    ivaPorcentaje: number;
    precioCompraReferencia: number;
    precioVentaBase: number;
    precioVentaTotal: number;
    stockTotal: number;
    // Campos opcionales para venta fraccionada
    precioVentaUnidad?: number;
    precioVentaBlister?: number;
    unidadesPorBlister?: number;
}

export interface ProductoConLotesResponse {
    detalleProducto: DetalleProducto;
    lotes: Lote[];
}

export interface MovimientoKardex {
    id: number;
    fecha: string;        // ISO 8601: "2026-02-11T10:00:00"
    tipo: 'ENTRADA' | 'SALIDA' | 'AJUSTE';
    cantidad: number;     // Puede ser positivo o negativo
    saldo_resultante: number; // CRÍTICO: El stock acumulado
    documento_ref: string;
    lote: string;
    usuario_responsable: string;
    detalle: string;
    costo_unitario?: number; // Opcional
    nombre_producto?: string; // Para vista global
}

// Interface for Smart Price Checker (Search)
export interface ProductoConsulta {
    productoId: number;
    nombreProducto: string;
    tipo: 'TANGIBLE' | 'SERVICIO';

    // Precios calculados automáticamente por el backend
    precioVentaBase?: number;       // Precio Base (sin IVA)
    precioVentaTotal?: number;      // Precio Total (con IVA)
    precioVentaUnidad?: number;     // Precio por unidad
    precioVentaBlister?: number;    // Precio por blister

    esFraccionable: boolean;
    unidadesPorCaja: number;
    unidadesPorBlister: number | null;
    esControlado: boolean;
    cantidadDisponible: number;
    estado: string;                // Ej: "STOCK_BAJO"
    imagenUrl?: string;            // Para visualización
}
