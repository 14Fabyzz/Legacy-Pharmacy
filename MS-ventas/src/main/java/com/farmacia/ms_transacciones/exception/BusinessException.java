package com.farmacia.ms_transacciones.exception;

/**
 * Excepción de negocio para errores relacionados con reglas de negocio.
 * Se usa para validaciones legales, restricciones comerciales, etc.
 */
public class BusinessException extends RuntimeException {

    public BusinessException(String message) {
        super(message);
    }

    public BusinessException(String message, Throwable cause) {
        super(message, cause);
    }
}
