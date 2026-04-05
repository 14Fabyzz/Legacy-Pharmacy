export type Periodicidad = 'DIARIO' | 'SEMANAL' | 'MENSUAL' | 'PERSONALIZADO';

export interface ReporteVentasFiltros {
  fechaInicio: string;
  fechaFin: string;
  periodicidad: Periodicidad;
  sucursalId?: number;
}

export interface GestionInventarioMetricas {
  rotacionInventarioIri: number;
  gmroi: number;
  sellThroughRate: number;
  weeksOfSupplyWos: number;
  isRealData?: boolean;
}

export interface VentasClientesMetricas {
  ticketPromedio: number;
  unitsPerTransactionUpt: number;
  margenUtilidadBruta: number;
}

export interface ResumenInteligenteResponse {
  resumenGenerado: string;
  metricasInventario?: GestionInventarioMetricas;
  metricasVentas?: VentasClientesMetricas;
}
