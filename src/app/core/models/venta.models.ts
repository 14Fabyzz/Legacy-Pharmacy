/**
 * Espejo exacto de los DTOs de Java (MS-ventas)
 * Ubicación Java: src/main/java/com/farmacia/ms_transacciones/dto/
 */

export interface ItemVentaDTO {
    productoId: number;
    cantidad: number;
    esVentaPorCaja: boolean; // true = Caja, false/null = Unidad
    precioUnitario?: number; // BigDecimal
    subtotal?: number;       // BigDecimal
}

export interface CrearVentaDTO {
    clienteId: number;
    items: ItemVentaDTO[];
    metodoPago: string;      // "EFECTIVO" | "TRANSFERENCIA" | "TARJETA"
    referenciaPago?: string;
    montoRecibido: number;   // BigDecimal
}

export interface AperturaCajaDTO {
    saldoInicial: number;    // BigDecimal
    sucursalId: number;
}

export interface CierreCajaDTO {
    dineroFinal: number; // BigDecimal
    turnoId: number;
    observaciones?: string;
}

/**
 * Espejo de com.farmacia.ms_transacciones.model.TurnoCaja
 */
export interface TurnoCaja {
    id: number;
    usuarioId: string;
    sucursalId: number;
    estado: 'ABIERTO' | 'CERRADO';
    fechaApertura: string;   // LocalDateTime (ISO)
    fechaCierre?: string;    // LocalDateTime (ISO)
    saldoInicial: number;
    totalVentasTeorico?: number;
    totalEfectivoReal?: number;
    diferencia?: number;
    observacionesCierre?: string;
}

/**
 * Espejo de com.farmacia.ms_transacciones.dto.ProductoInventarioDTO
 * (Validar contra respuesta real de InventarioClient si es necesario,
 * aquí se asume la estructura vista en ProductoInventarioDTO.java)
 */
export interface ProductoInventarioDTO {
    productoId: number;
    nombreProducto: string; // @JsonProperty("nombreProducto")
    tipo: string;
    precioVentaBase: number;
    precioVentaUnidad: number;
    esFraccionable: boolean;
    unidadesPorCaja: number;
    unidadesPorBlister: number;
    esControlado: boolean;
    cantidadDisponible: number;
}

export interface VentaResponseDTO {
    id: number;
    numeroFactura: string;
    fechaVenta: string;
    total: number;
    montoRecibido: number;
    cambio: number;
    vendedorNombre: string;
    sucursalId: number;
    metodoPago: string;
    referenciaPago: string;
    estado: string;
    clienteId: number;
    items: ItemVentaDTO[];
}
