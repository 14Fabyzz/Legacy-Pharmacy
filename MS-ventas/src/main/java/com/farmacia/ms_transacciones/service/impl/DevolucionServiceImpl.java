package com.farmacia.ms_transacciones.service.impl;

import com.farmacia.ms_transacciones.client.InventarioClient;
import com.farmacia.ms_transacciones.dto.ItemDevolucionDTO;
import com.farmacia.ms_transacciones.dto.SolicitudDevolucionDTO;
import com.farmacia.ms_transacciones.model.*;
import com.farmacia.ms_transacciones.repository.*;
import com.farmacia.ms_transacciones.service.DevolucionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Service
public class DevolucionServiceImpl implements DevolucionService {

    @Autowired private VentaRepository ventaRepository;
    @Autowired private DevolucionRepository devolucionRepository;
    @Autowired private NotaCreditoRepository notaCreditoRepository;
    @Autowired private InventarioClient inventarioClient;

    @Override
    @Transactional
    public NotaCredito procesarDevolucion(SolicitudDevolucionDTO solicitud) {
        // 1. Buscar Venta Original
        Venta venta = ventaRepository.findById(solicitud.getVentaId())
                .orElseThrow(() -> new RuntimeException("Venta no encontrada"));

        // 2. Crear Entidad Devolución
        Devolucion devolucion = new Devolucion();
        devolucion.setNumeroDevolucion(UUID.randomUUID().toString());
        devolucion.setFechaDevolucion(LocalDateTime.now());
        devolucion.setMotivo(solicitud.getMotivo());
        devolucion.setVenta(venta);

        BigDecimal totalReembolso = BigDecimal.ZERO;

        // 3. Procesar Items devueltos
        for (ItemDevolucionDTO item : solicitud.getItems()) {
            // Buscar el precio al que se vendió originalmente (en detalle_ventas)
            DetalleVenta detalleOriginal = venta.getDetalles().stream()
                    .filter(d -> d.getProductoId().equals(item.getProductoId()))
                    .findFirst()
                    .orElseThrow(() -> new RuntimeException("El producto " + item.getProductoId() + " no pertenece a esta venta"));

            // Validar cantidad
            if (item.getCantidad() > detalleOriginal.getCantidad()) {
                throw new RuntimeException("No puedes devolver más productos de los comprados");
            }

            // Calcular reembolso (Precio original * cantidad devuelta)
            BigDecimal subtotal = detalleOriginal.getPrecioUnitario().multiply(new BigDecimal(item.getCantidad()));
            totalReembolso = totalReembolso.add(subtotal);

            // 4. RETORNAR STOCK A INVENTARIO (Llamada al otro MS)
            inventarioClient.registrarDevolucion(item.getProductoId(), item.getCantidad());
        }

        devolucion.setTotalDevolucion(totalReembolso);
        devolucion = devolucionRepository.save(devolucion);

        // 5. Generar Nota de Crédito
        NotaCredito nota = new NotaCredito();
        nota.setNumeroNota("NC-" + UUID.randomUUID().toString().substring(0, 8));
        nota.setFechaEmision(LocalDateTime.now());
        nota.setMonto(totalReembolso);
        nota.setDevolucion(devolucion);
        nota.setCliente(venta.getCliente()); // Asociar al mismo cliente de la venta

        return notaCreditoRepository.save(nota);
    }
}