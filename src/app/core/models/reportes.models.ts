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
