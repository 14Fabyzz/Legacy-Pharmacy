// Interfaces basadas en tu Script SQL

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

export interface Producto {
  id: number;
  codigo_interno: string;
  codigo_barras: string; // Made required as per request (or implied)
  nombre_comercial: string;
  concentracion: string;
  presentacion: string;

  // Optional/Nullable in SQL or UI
  laboratorio_nombre?: string;

  precio_venta_base: number;
  iva_porcentaje: number;
  stock_minimo: number;

  es_controlado: boolean;
  refrigerado: boolean;
  estado: string; // 'ACTIVO' | 'INACTIVO' etc.

  // Optional for UI logic (semaphore)
  proximo_vencimiento?: string | Date;
  daysUntilExpiry?: number;

  // Keeping existing relations to avoid breaking other components silently, 
  // but they can be optional if not in the new SQL requirement list.
  categoria_id?: number;
  laboratorio_id?: number;
  principio_activo_id?: number;

  // Other fields that might be useful
  registro_invima?: string;
  precio_compra_referencia?: number;
  margen_minimo_porcentaje?: number;
}

export interface Lote {
  id: number;
  producto_id: number;
  numero_lote: string;
  fecha_vencimiento: Date | string; // Puede venir como string del JSON
  cantidad_actual: number;
  costo_compra: number;
}

// Interface para el procedimiento de entrada de mercancía
export interface EntradaMercanciaRequest {
  producto_id: number;
  numero_lote: string;
  cantidad: number;
  costo_compra: number;
  fecha_vencimiento: string; // Formato YYYY-MM-DD
  usuario_responsable: string;
  sucursal_id: number;
  observaciones?: string;
}