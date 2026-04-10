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

export interface CierreTurnoConciliacionDTO {
  id: number;
  usuarioId: string;
  sucursalId: number;
  estado: string;
  fechaApertura: string;
  fechaCierre: string;
  saldoInicial: number;
  totalVentasTeorico: number;
  totalEfectivoReal: number;
  totalEgresos: number;
  diferencia: number;
  observacionesCierre: string;
}

export interface MovimientoTurnoDTO {
  id: number;
  fecha: string;
  tipo: string;
  monto: number;
  referencia: string;
  descripcion: string;
}

export interface CierreTurnoIntegralDTO {
  encabezado: CierreTurnoConciliacionDTO;
  movimientos: MovimientoTurnoDTO[];
}
