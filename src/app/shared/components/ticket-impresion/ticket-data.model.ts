export interface TicketItem {
    cantidad: number;
    productoNombre: string;
    precioUnitario: number;
    descuento: number;
    totalFila: number;
}

export interface TicketData {
    id: string;
    fechaVenta: Date;
    clienteNombre?: string;
    items: TicketItem[];
    subtotal: number;
    ajusteRedondeo: number;
    totalIva: number;
    totalAPagar: number;
    metodoPago: string;
    montoRecibido: number;
    cambio: number;
}
