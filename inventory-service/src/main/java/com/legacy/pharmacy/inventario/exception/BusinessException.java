package com.legacy.pharmacy.inventario.exception;

/**
 * Excepción para errores de lógica de negocio
 * 
 * Uso:
 * throw new BusinessException("Stock insuficiente para realizar la venta");
 */
public class BusinessException extends RuntimeException {
    
    public BusinessException(String message) {
        super(message);
    }

    public BusinessException(String message, Throwable cause) {
        super(message, cause);
    }
}
