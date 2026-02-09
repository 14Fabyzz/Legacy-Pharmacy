export interface ItemVentaDTO {
    productoId: number;
    cantidad: number;
    esVentaPorCaja: boolean; // true = Caja, false/null = Unidad
    precioUnitario?: number; // BigDecimal
    subtotal?: number; // BigDecimal
}

export interface CrearVentaDTO {
    clienteId: number;
    items: ItemVentaDTO[];
    metodoPago: string;      // "EFECTIVO" or "TRANSFERENCIA"
    referenciaPago?: string;  // Optional
    montoRecibido: number;   // BigDecimal
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
    metodoPago: string;
    referenciaPago?: string;
    estado: string;
    clienteId: number;
    items: ItemVentaDTO[];
}
