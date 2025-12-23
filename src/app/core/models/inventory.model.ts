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
  codigo_barras?: string;
  nombre_comercial: string;
  concentracion?: string;
  presentacion?: string;
  registro_invima?: string;
  
  // Relaciones
  categoria_id: number;
  laboratorio_id: number;
  principio_activo_id?: number;
  
  categoria_nombre?: string;
  laboratorio_nombre?: string;
  principio_activo_nombre?: string;

  // Precios
  precio_compra_referencia?: number;
  precio_venta_base: number;
  iva_porcentaje: number;
  margen_minimo_porcentaje: number;
  stock_minimo: number;
  
  // Banderas
  es_controlado: boolean;
  refrigerado: boolean;
  estado: 'ACTIVO' | 'DESCONTINUADO' | 'AGOTADO';

  // --- NUEVO: Para el Semáforo ---
  // Esta fecha vendría de tu backend (del lote que vence más pronto)
  proximo_vencimiento?: string | Date; 
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