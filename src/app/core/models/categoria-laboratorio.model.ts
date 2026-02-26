/**
 * Modelo: Categoría de Producto
 * Usa borrado lógico (soft delete) mediante el campo `activo`.
 */
export interface Categoria {
    id: number;
    nombre: string;
    descripcion: string;
    activa: boolean;
}

/**
 * Petición para crear / editar una Categoría
 */
export interface CategoriaRequest {
    nombre: string;
    descripcion: string;
    activa: boolean;
}
/**
 * Modelo: Laboratorio / Proveedor
 * Usa borrado lógico (soft delete) mediante el campo `activo`.
 */
export interface Laboratorio {
    id: number;
    nombre: string;
    descripcion: string;
    activo: boolean;
}

/**
 * Payload para crear o editar un Laboratorio.
 */
export interface LaboratorioRequest {
    nombre: string;
    descripcion: string;
    activo: boolean;
}
