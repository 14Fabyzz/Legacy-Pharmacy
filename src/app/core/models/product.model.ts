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

    precio_venta_base: number;
    precio_compra_referencia?: number; // Added for Purchase Entry
    iva_porcentaje: number;
    stock_minimo: number;
    stock_actual: number;

    tipo: 'TANGIBLE' | 'SERVICIO'; // Default 'TANGIBLE'
    unidadesPorBlister?: number;   // Nuevo campo informativo

    // Campos Fraccionamiento [NUEVOS]
    unidadesPorCaja: number;
    esFraccionable: boolean;
    precioVentaUnidad?: number;

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

    precioVentaBase: number;
    ivaPorcentaje: number;
    stockMinimo: number;
    stockActual: number;

    tipo: 'TANGIBLE' | 'SERVICIO';
    unidadesPorBlister?: number;

    // Campos Fraccionamiento [NUEVOS]
    unidadesPorCaja: number;
    esFraccionable: boolean;
    precioVentaUnidad?: number | null; // Permite null para que el backend calcule automáticamente

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
    concentracion: string;        // [NUEVO]
    presentacion: string;         // [NUEVO]
    principioActivo: string;
    codigoInterno: string;
    codigoBarras?: string;
    laboratorio: string;
    categoria: string;
    stockTotal: number;
    stockMinimo: number;
    precioVentaBase: number;
    nivelStock: string;
    proximoVencimiento?: string;  // Change to string as requested

    // Campos Fraccionamiento [NUEVOS]
    esFraccionable: boolean;
    unidadesPorCaja: number; // [NUEVO] Required for Hints
    precioVentaUnidad?: number;

    tipo?: 'TANGIBLE' | 'SERVICIO';
    esControlado?: boolean;
}

export interface Lote {
    id: number;
    numeroLote: string;
    fechaVencimiento: string | Date;
    cantidadActual: number;
    costoCompra: number;
}

export interface MovimientoKardex {
    id: number;
    fecha: string; // Viene como ISO string
    tipo: 'ENTRADA' | 'SALIDA' | 'AJUSTE'; // O string general
    cantidad: number; // Puede ser negativo (ej: -5)
    saldo_resultante: number;
    documento_ref: string;
    usuario: string;
    detalle: string; // Antes era 'motivo' o 'notas'
    lote: string;
    costo_unitario: number;
}

// Interface for Smart Price Checker (Search)
export interface ProductoConsulta {
    productoId: number;
    nombreProducto: string;
    tipo: 'TANGIBLE' | 'SERVICIO';
    precioVentaBase: number;       // Precio Caja
    precioVentaUnidad: number | null;
    precioVentaBlister: number | null;
    esFraccionable: boolean;
    unidadesPorCaja: number;
    unidadesPorBlister: number | null;
    esControlado: boolean;
    cantidadDisponible: number;
    estado: string;                // Ej: "STOCK_BAJO"
    imagenUrl?: string;            // Para visualización
}
