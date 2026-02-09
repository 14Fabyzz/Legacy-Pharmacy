package com.legacy.pharmacy.inventario.exception;

/**
 * Excepción para cuando no se encuentra un recurso
 * 
 * Uso:
 * throw new ResourceNotFoundException("Producto con ID " + id + " no encontrado");
 */
public class ResourceNotFoundException extends RuntimeException {
    
    public ResourceNotFoundException(String message) {
        super(message);
    }

    public ResourceNotFoundException(String message, Throwable cause) {
        super(message, cause);
    }

    /**
     * Factory methods para casos comunes
     */
    public static ResourceNotFoundException producto(Integer id) {
        return new ResourceNotFoundException("Producto con ID " + id + " no encontrado");
    }

    public static ResourceNotFoundException lote(Integer id) {
        return new ResourceNotFoundException("Lote con ID " + id + " no encontrado");
    }

    public static ResourceNotFoundException categoria(Integer id) {
        return new ResourceNotFoundException("Categoría con ID " + id + " no encontrada");
    }

    public static ResourceNotFoundException laboratorio(Integer id) {
        return new ResourceNotFoundException("Laboratorio con ID " + id + " no encontrado");
    }
}
