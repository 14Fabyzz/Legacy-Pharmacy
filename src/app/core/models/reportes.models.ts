export interface PeriodoVentaDTO {
  periodo: string;
  totalIngresos: number;
  totalIva: number;
  subtotalNeto: number;
  totalDescuentos: number;
  cantidadVentas: number;
}

export interface ReporteVentasConsolidadasDTO {
  fechaInicio: string;
  fechaFin: string;
  periodicidad: string;
  sucursalId: number | null;
  totalIngresos: number;
  totalIva: number;
  subtotalNeto: number;
  totalDescuentos: number;
  cantidadVentas: number;
  periodos: PeriodoVentaDTO[];
}

export type Periodicidad = 'DIARIO' | 'SEMANAL' | 'MENSUAL';

export interface ReporteVentasFiltros {
  fechaInicio: string;
  fechaFin: string;
  periodicidad: Periodicidad;
  sucursalId?: number;
}

export interface TopProductoResponse {
  nombreProducto: string;
  presentacion: string;
  totalVendido: number;
  ingresoGenerado: number;
}

export interface MetodoPagoDTO {
  nombreMetodo: string;
  cantidadVentas: number;
  totalRecaudado: number;
  porcentajeParticipacion: number;
}

export interface DetalleReferenciaPagoDTO {
  idVenta: number;
  referenciaPago: string;
  monto: number;
  fechaVenta: string;
  metodoPago: string;
}

export interface ConsolidadoPagosResponse {
  fechaInicio: string;
  fechaFin: string;
  sucursalId: number | null;
  granTotal: number;
  metodosPago: MetodoPagoDTO[];
  detallesReferencias: DetalleReferenciaPagoDTO[];
}

export interface ResumenInteligenteResponse {
  resumenGenerado: string;
}
