export enum TipoVenta {
    CAJA = 'CAJA',
    BLISTER = 'BLISTER',
    UNIDAD = 'UNIDAD'
}

export type MetodoPago = 'EFECTIVO' | 'TRANSFERENCIA' | 'TARJETA';

export interface ItemVentaDTO {
    productoId: number;
    cantidad: number;
    tipoVenta: TipoVenta;
    // Campos UI
    // Campos UI eliminados del DTO de envío para evitar errores de backend
    // precioUnitarioEstimado?: number;
    // subtotalEstimado?: number;
    // esVentaPorCaja?: boolean; // Eliminado por obsoleto
}

export interface CrearVentaDTO {
    clienteId: number | null;
    items: ItemVentaDTO[];
    metodoPago: MetodoPago;
    referenciaPago?: string;
    montoRecibido?: number;
}

export interface VentaResponseDTO {
    id: number;
    numeroFactura: string;
    fechaVenta: string; // ISO
    total: number;
    montoRecibido: number;
    cambio: number;
    vendedorNombre: string;
    sucursalId: number;
    metodoPago: MetodoPago;
    referenciaPago?: string;
    estado: string;
    clienteId: number;
    items: ItemVentaDTO[];
    totalIva?: number; // Added for tax breakdown
}

export interface DetalleProductoDTO {
    id: number;
    nombreComercial: string;
    stockTotal: number;
    codigoBarras: string;
    laboratorio: string;
    presentacion: string;
    // Precios
    precioVentaTotal: number; // Precio Caja
    precioVentaBlister: number;
    precioVentaUnidad: number;
    // Flags
    esFraccionable: boolean;
    imagen?: string;
}

export interface ProductoBusquedaResponse {
    detalleProducto: DetalleProductoDTO;
    lotes: any[]; // Por ahora any array si no necesitamos detalle de lotes
}

export interface CartItem {
    product: ProductoBusquedaResponse;
    cantidad: number;
    tipoVenta: TipoVenta;
    precio: number;
    subtotal: number;
    error?: string;
    imagenUrl?: string | null;
}
