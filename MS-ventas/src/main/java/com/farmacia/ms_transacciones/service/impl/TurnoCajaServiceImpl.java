package com.farmacia.ms_transacciones.service.impl;

import com.farmacia.ms_transacciones.config.UserContext;
import com.farmacia.ms_transacciones.dto.AperturaCajaDTO;
import com.farmacia.ms_transacciones.dto.CierreCajaDTO;
import com.farmacia.ms_transacciones.model.TurnoCaja;
import com.farmacia.ms_transacciones.model.Venta;
import com.farmacia.ms_transacciones.repository.TurnoCajaRepository;
import com.farmacia.ms_transacciones.repository.VentaRepository;
import com.farmacia.ms_transacciones.service.TurnoCajaService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class TurnoCajaServiceImpl implements TurnoCajaService {

    @Autowired
    private TurnoCajaRepository turnoCajaRepository;

    @Autowired
    private VentaRepository ventaRepository; // Necesario para sumar las ventas al cerrar

    @Override
    public TurnoCaja abrirCaja(AperturaCajaDTO datos) {
        String usuarioId = String.valueOf(UserContext.getUserId());

        // 1. Validar que no tenga caja abierta
        Optional<TurnoCaja> turnoExistente = turnoCajaRepository.findByUsuarioIdAndEstado(usuarioId, "ABIERTO");
        if (turnoExistente.isPresent()) {
            throw new RuntimeException("El usuario ya tiene un turno abierto. Debe cerrarlo primero.");
        }

        // 2. Crear nuevo turno
        TurnoCaja turno = new TurnoCaja();
        turno.setUsuarioId(usuarioId);
        turno.setSucursalId(datos.getSucursalId());
        turno.setFechaApertura(LocalDateTime.now());
        turno.setSaldoInicial(datos.getSaldoInicial());
        turno.setEstado("ABIERTO");

        // Inicializar valores en 0
        turno.setTotalVentasTeorico(BigDecimal.ZERO);
        turno.setTotalEfectivoReal(BigDecimal.ZERO);
        turno.setDiferencia(BigDecimal.ZERO);

        return turnoCajaRepository.save(turno);
    }

    @Override
    @Transactional
    public TurnoCaja cerrarCaja(CierreCajaDTO datos) {
        // 1. Obtener turno abierto
        TurnoCaja turno = obtenerTurnoAbiertoActual();

        // 2. Calcular Total de Ventas en el sistema (Teórico)
        List<Venta> ventasDelTurno = ventaRepository.findByTurnoId(turno.getId());
        BigDecimal totalVentas = ventasDelTurno.stream()
                .map(Venta::getTotal)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        // 3. Calcular diferencia
        BigDecimal esperado = turno.getSaldoInicial().add(totalVentas);
        BigDecimal diferencia = datos.getTotalEfectivoReal().subtract(esperado);

        // 4. Actualizar datos de cierre en el objeto turno
        turno.setDiferencia(diferencia);
        turno.setTotalVentasTeorico(totalVentas);
        turno.setTotalEfectivoReal(datos.getTotalEfectivoReal());
        turno.setObservacionesCierre(datos.getObservaciones());

        // --- VALIDACIÓN DE JUSTIFICACIÓN ---
        // Si la diferencia NO es cero (positiva o negativa)
        if (diferencia.compareTo(BigDecimal.ZERO) != 0) {
            // Y las observaciones están vacías o nulas
            if (datos.getObservaciones() == null || datos.getObservaciones().trim().isEmpty()) {
                throw new RuntimeException("ERROR AL CERRAR: Existe un descuadre de " + diferencia + ". Debe ingresar una observación justificando el faltante o sobrante.");
            }
        }
        // -----------------------------------

        turno.setFechaCierre(LocalDateTime.now());
        turno.setEstado("CERRADO");

        return turnoCajaRepository.save(turno);
    }

    @Override
    public TurnoCaja obtenerTurnoAbiertoActual() {
        String usuarioId = String.valueOf(UserContext.getUserId());
        return turnoCajaRepository.findByUsuarioIdAndEstado(usuarioId, "ABIERTO")
                .orElseThrow(() -> new RuntimeException("No hay un turno abierto para este usuario."));
    }
}