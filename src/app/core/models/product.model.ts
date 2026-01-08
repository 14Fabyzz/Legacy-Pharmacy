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
    iva_porcentaje: number;
    stock_minimo: number;
    stock_actual: number;

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
}
