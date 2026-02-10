package com.legacy.pharmacy.inventario.service;

import com.legacy.pharmacy.inventario.config.UserContext; // ← NUEVO
import com.legacy.pharmacy.inventario.dto.DashboardAlertasDTO;
import com.legacy.pharmacy.inventario.dto.EntradaMercanciaDTO;
import com.legacy.pharmacy.inventario.dto.StockDTO; // ← NUEVO
import com.legacy.pharmacy.inventario.entity.Lote;
import com.legacy.pharmacy.inventario.entity.Producto; // ← NUEVO
import com.legacy.pharmacy.inventario.repository.LoteRepository;
import com.legacy.pharmacy.inventario.repository.ProductoRepository; // ← NUEVO
import lombok.extern.slf4j.Slf4j; // ← NUEVO
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate; // ← NUEVO
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import jakarta.persistence.EntityManager;
import jakarta.persistence.ParameterMode;
import jakarta.persistence.PersistenceContext;
import jakarta.persistence.StoredProcedureQuery;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import org.springframework.jdbc.support.KeyHolder;
import org.springframework.jdbc.support.GeneratedKeyHolder;

@Slf4j // ← NUEVO
@Service
public class InventarioService {

        @Autowired
        private LoteRepository loteRepository;

        @Autowired
        private ProductoRepository productoRepository; // ← NUEVO

        @Autowired
        private JdbcTemplate jdbcTemplate; // ← NUEVO

        @PersistenceContext
        private EntityManager entityManager;

        @Transactional
        public Map<String, Object> registrarEntrada(EntradaMercanciaDTO entrada) {
                // 1. Validar producto y obtener datos de conversión
                Producto producto = productoRepository.findById(entrada.getProductoId())
                                .orElseThrow(() -> new RuntimeException(
                                                "Producto no encontrado: " + entrada.getProductoId()));

                log.info("DEBUG_STOCK: ProductoId={}, UnidadesPorCaja={}, EsFraccionable={}, CantidadEntrada={}",
                                producto.getId(), producto.getUnidadesPorCaja(), producto.getEsFraccionable(),
                                entrada.getCantidad());

                // 3. Persistir en Base de Datos

                // Conversión: Cajas -> Unidades (Si aplica)
                int cantidadReal = entrada.getCantidad();
                if (Boolean.TRUE.equals(producto.getEsFraccionable()) && producto.getUnidadesPorCaja() != null
                                && producto.getUnidadesPorCaja() > 1) {
                        cantidadReal = entrada.getCantidad() * producto.getUnidadesPorCaja();
                }

                // 3. Persistir usando JDBC Template DIRECTO (Reemplaza al SP para estabilidad)

                // Calculo Costo Unitario
                BigDecimal costoUnitario = BigDecimal.ZERO;
                if (cantidadReal > 0 && entrada.getCostoCompra() != null) {
                        costoUnitario = entrada.getCostoCompra().divide(BigDecimal.valueOf(cantidadReal), 4,
                                        RoundingMode.HALF_UP);
                }

                String sqlInsertLote = "INSERT INTO lotes (producto_id, numero_lote, fecha_vencimiento, cantidad_actual, costo_compra, sucursal_id) VALUES (?, ?, ?, ?, ?, ?)";

                KeyHolder keyHolder = new GeneratedKeyHolder();

                int finalCantidadReal = cantidadReal; // Para lambda
                BigDecimal finalCostoUnitario = costoUnitario; // Para lambda

                log.info("NUCLEAR OPTION: Insertando Lote. Cantidad={}, Costo={}", finalCantidadReal,
                                finalCostoUnitario);

                jdbcTemplate.update(connection -> {
                        java.sql.PreparedStatement ps = connection.prepareStatement(sqlInsertLote,
                                        java.sql.Statement.RETURN_GENERATED_KEYS);
                        ps.setInt(1, entrada.getProductoId());
                        ps.setString(2, entrada.getNumeroLote());
                        ps.setObject(3, entrada.getFechaVencimiento());
                        ps.setInt(4, 0); // ← Se inicia en 0, el trigger lo actualizará al insertar movimiento
                        ps.setBigDecimal(5, finalCostoUnitario);
                        ps.setInt(6, entrada.getSucursalId());
                        return ps;
                }, keyHolder);

                Number loteId = keyHolder.getKey();

                // Insertar Movimiento
                String sqlMov = "INSERT INTO movimientos (lote_id, tipo_movimiento, cantidad, usuario_responsable, sucursal_id, observaciones) VALUES (?, ?, ?, ?, ?, ?)";
                jdbcTemplate.update(sqlMov,
                                loteId,
                                "ENTRADA",
                                cantidadReal,
                                entrada.getUsuarioResponsable() != null ? entrada.getUsuarioResponsable() : "SISTEMA",
                                entrada.getSucursalId(),
                                entrada.getObservaciones());

                return java.util.Map.of("estado", "OK", "mensaje", "Entrada registrada (Direct JDBC)");
        }

        // AGREGA ESTO A InventarioService.java

        @Transactional
        public Map<String, Object> registrarEntradaMasiva(List<EntradaMercanciaDTO> entradas) {
                int procesados = 0;

                for (EntradaMercanciaDTO dto : entradas) {
                        // Reutilizamos la lógica que ya tienes para registrar uno solo
                        registrarEntrada(dto);
                        procesados++;
                }

                return Map.of(
                                "mensaje", "Se han procesado correctamente los lotes.",
                                "cantidadProcesada", procesados);
        }

        // --- MÉTODO DE SALIDA ---
        // --- MÉTODO DE SALIDA ---
        @Transactional
        public List<Map<String, Object>> registrarSalida(com.legacy.pharmacy.inventario.dto.SalidaMercanciaDTO salida) {
                // 1. Obtener producto para factores de conversión
                Producto producto = productoRepository.findById(salida.getProductoId())
                                .orElseThrow(() -> new RuntimeException(
                                                "Producto no encontrado: " + salida.getProductoId()));

                // 2. Determinar Tipo de Venta (Prioridad: Enum > Boolean > Default)
                com.legacy.pharmacy.inventario.enums.TipoVenta tipo = salida.getTipoVenta();
                if (tipo == null) {
                        @SuppressWarnings("deprecation") // Backwards compatibility until MS-ventas migration
                        Boolean esVentaPorCaja = salida.getEsVentaPorCaja();
                        if (Boolean.TRUE.equals(esVentaPorCaja)) {
                                tipo = com.legacy.pharmacy.inventario.enums.TipoVenta.CAJA;
                        } else {
                                tipo = com.legacy.pharmacy.inventario.enums.TipoVenta.UNIDAD;
                        }
                }

                // 3. Calcular cantidad total en UNIDADES (Pastillas)
                int cantidadTotalUnidades = salida.getCantidad();

                switch (tipo) {
                        case CAJA:
                                if (producto.getUnidadesPorCaja() != null && producto.getUnidadesPorCaja() > 0) {
                                        cantidadTotalUnidades = salida.getCantidad() * producto.getUnidadesPorCaja();
                                }
                                break;
                        case BLISTER:
                                if (producto.getUnidadesPorBlister() != null && producto.getUnidadesPorBlister() > 0) {
                                        cantidadTotalUnidades = salida.getCantidad() * producto.getUnidadesPorBlister();
                                } else {
                                        throw new RuntimeException(
                                                        "El producto no tiene configuradas unidades por blister.");
                                }
                                break;
                        case UNIDAD:
                        default:
                                // Ya está en unidades
                                break;
                }

                // 4. Llamar al SP enviando el TOTAL DE UNIDADES y marcando esVentaPorCaja =
                // false
                return loteRepository.registrarSalida(
                                salida.getProductoId(),
                                cantidadTotalUnidades, // Envío total unidades
                                "VENDEDOR_APP",
                                salida.getSucursalId(),
                                salida.getVentaId(),
                                salida.getObservaciones(),
                                false // <-- Indico que son UNIDADES
                );
        }

        // =========================================================================
        // =========================================================================
        // TODO LO DE ABAJO ES NUEVO - PARA INTEGRACIÓN CON MS-VENTAS
        // =========================================================================
        // =========================================================================

        /**
         * Consultar stock disponible de un producto
         * Este método será llamado por MS-Ventas antes de crear una venta
         * 
         * @param productoId ID del producto
         * @param sucursalId ID de la sucursal (opcional, para filtrar stock por
         *                   sucursal)
         */
        public StockDTO consultarStock(Integer productoId, Integer sucursalId) {
                log.info("Consultando stock del producto {} en sucursal {} - Usuario: {}",
                                productoId, sucursalId != null ? sucursalId : "TODAS", UserContext.getUsername());

                // 1. Buscas el producto
                Producto producto = productoRepository.findById(productoId)
                                .orElseThrow(() -> new RuntimeException("Producto no encontrado: " + productoId));

                // 2. Calculas el disponible desde lotes
                String sql = "SELECT COALESCE(SUM(cantidad_actual), 0) " +
                                "FROM lotes " +
                                "WHERE producto_id = ? " +
                                "AND cantidad_actual > 0 " +
                                "AND fecha_vencimiento > CURDATE()";

                Integer disponible;
                if (sucursalId != null) {
                        sql += " AND sucursal_id = ?";
                        disponible = jdbcTemplate.queryForObject(sql, Integer.class, productoId, sucursalId);
                        log.debug("Query con filtro de sucursal: sucursalId={}", sucursalId);
                } else {
                        disponible = jdbcTemplate.queryForObject(sql, Integer.class, productoId);
                        log.debug("Query sin filtro de sucursal (stock global)");
                }

                // 3. Determinar estado del stock (Esta parte faltaba en tu resumen)
                String estado;
                if (disponible == null || disponible == 0) {
                        estado = "SIN_STOCK";
                } else if (disponible <= producto.getStockMinimo()) {
                        estado = "STOCK_BAJO";
                } else {
                        estado = "STOCK_OK";
                }

                // 4. Crear y llenar el DTO de respuesta
                StockDTO stock = new StockDTO();
                stock.setProductoId(producto.getId());
                stock.setNombreProducto(producto.getNombreComercial());
                stock.setTipo(producto.getTipo() != null ? producto.getTipo().name() : "TANGIBLE");

                // --- CONFIGURACIÓN DE PRECIOS Y FRACCIONAMIENTO ---
                // Estos datos permiten al MS-Ventas calcular correctamente el precio según
                // si la venta es por Caja o por Unidad
                stock.setPrecioVentaBase(producto.getPrecioVentaBase());
                stock.setPrecioVentaUnidad(producto.getPrecioVentaUnidad());
                stock.setPrecioVentaBlister(producto.getPrecioVentaBlister());
                stock.setEsFraccionable(producto.getEsFraccionable());
                stock.setUnidadesPorCaja(producto.getUnidadesPorCaja());
                stock.setUnidadesPorBlister(producto.getUnidadesPorBlister()); // Informativo para UX
                stock.setEsControlado(producto.getEsControlado()); // Control legal
                // ----------------------------------------------

                stock.setCantidadDisponible(disponible != null ? disponible : 0);
                stock.setCantidadMinima(producto.getStockMinimo());
                stock.setEstado(estado);
                stock.setDisponibleParaVenta(
                                disponible != null && disponible > 0 && "ACTIVO".equals(producto.getEstado()));

                log.debug("Stock consultado: disponible={}, estado={}", disponible, estado);

                return stock;
        }

        /**
         * Descontar inventario después de una venta
         * Este método será llamado por MS-Ventas después de crear una venta exitosa
         *
         * Usa tu procedimiento almacenado existente: sp_registrar_salida
         */
        /**
         * Descontar inventario después de una venta
         * Ahora soporta venta por Caja o Unidad
         */
        @Transactional
        public void descontarInventario(Integer productoId, Integer cantidad, String motivo, Boolean esVentaPorCaja) {
                log.info("Descontando {} del producto {} (Por Caja: {}) - Motivo: {}",
                                cantidad, productoId, esVentaPorCaja, motivo);

                Long userId = UserContext.getUserId();
                String username = UserContext.getUsername();

                if (userId == null) {
                        throw new RuntimeException("No se puede descontar inventario: usuario no identificado");
                }

                // Verificar que el producto existe
                productoRepository.findById(productoId)
                                .orElseThrow(() -> new RuntimeException("Producto no encontrado: " + productoId));

                // LÓGICA DELEGADA A LA BASE DE DATOS (Smart SP)
                // El SP se encargará de validar si es Fraccionable y de multiplicar si es Caja.
                // Nosotros solo pasamos la intención del usuario.

                try {
                        loteRepository.registrarSalida(
                                        productoId,
                                        cantidad, // Cantidad original (Cajas o Unidades)
                                        username != null ? username : "SISTEMA",
                                        1, // sucursal_id - ajusta según necesites
                                        null, // venta_id - NULL porque MS-Ventas tiene su propio ID
                                        motivo,
                                        Boolean.TRUE.equals(esVentaPorCaja) // <-- Pasamos el flag al SP
                        );

                        log.info("Solicitud de descuento enviada a DB: producto={}, cantidad={}, esVentaPorCaja={}",
                                        productoId, cantidad, esVentaPorCaja);

                } catch (Exception e) {
                        log.error("Error al descontar inventario: {}", e.getMessage());
                        throw new RuntimeException("Error al descontar inventario: " + e.getMessage(), e);
                }
        }

        // Sobrecarga para mantener compatibilidad si alguien llama sin el flag (asume
        // unidad o caja según lógica por defecto)
        @Transactional
        public void descontarInventario(Integer productoId, Integer cantidad, String motivo) {
                // Por defecto asumimos venta por UNIDAD (o lo que sea el estándar)
                // O mejor, asumimos FALSE para no multiplicar mágicamente
                descontarInventario(productoId, cantidad, motivo, false);
        }

        /**
         * Devolver inventario cuando se anula una venta
         * Este método será llamado por MS-Ventas cuando se anule una venta
         *
         * Usa tu procedimiento almacenado existente: sp_registrar_entrada
         */
        /**
         * Devolver inventario usando un ajuste directo
         * No usa procedimientos almacenados para evitar duplicación
         */
        @Transactional
        public void devolverInventario(Integer productoId, Integer cantidad, String motivo) {
                log.info("Devolviendo {} unidades del producto {} - Motivo: {} - Usuario: {}",
                                cantidad, productoId, motivo, UserContext.getUsername());

                Long userId = UserContext.getUserId();
                String username = UserContext.getUsername();

                if (userId == null) {
                        throw new RuntimeException("No se puede devolver inventario: usuario no identificado");
                }

                // Verificar que el producto existe
                Producto producto = productoRepository.findById(productoId)
                                .orElseThrow(() -> new RuntimeException("Producto no encontrado: " + productoId));

                try {
                        // Obtener el lote más reciente del producto
                        Integer loteId = jdbcTemplate.queryForObject(
                                        "SELECT id FROM lotes " +
                                                        "WHERE producto_id = ? " +
                                                        "ORDER BY created_at DESC " +
                                                        "LIMIT 1",
                                        Integer.class,
                                        productoId);

                        if (loteId == null) {
                                throw new RuntimeException("No existe un lote para devolver inventario");
                        }

                        // Insertar movimiento de DEVOLUCION (cantidad positiva)
                        jdbcTemplate.update(
                                        "INSERT INTO movimientos (lote_id, tipo_movimiento, cantidad, usuario_responsable, sucursal_id, observaciones) "
                                                        +
                                                        "VALUES (?, 'DEVOLUCION', ?, ?, 1, ?)",
                                        loteId,
                                        cantidad, // Cantidad positiva
                                        username != null ? username : "SISTEMA",
                                        motivo);

                        // El trigger se encargará de actualizar la cantidad_actual

                        log.info("Inventario devuelto exitosamente: producto={}, cantidad={}, lote={}",
                                        productoId, cantidad, loteId);

                } catch (Exception e) {
                        log.error("Error al devolver inventario: {}", e.getMessage());
                        throw new RuntimeException("Error al devolver inventario: " + e.getMessage(), e);
                }
        }

        // ==========================================
        // LÓGICA EXCLUSIVA PARA INTEGRACIÓN CON VENTAS
        // ==========================================

        // 1. Consultar Stock (Suma la cantidad actual de todos los lotes válidos)
        public Integer consultarStockActual(Integer productoId) {
                String sql = "SELECT COALESCE(SUM(cantidad_actual), 0) FROM lotes " +
                                "WHERE producto_id = ? AND cantidad_actual > 0 AND fecha_vencimiento > CURRENT_DATE";

                return jdbcTemplate.queryForObject(sql, Integer.class, productoId);
        }

        // 2. Descontar Inventario (Lógica FIFO/FEFO automática)
        @Transactional
        public void descontarInventarioVenta(Integer productoId, Integer cantidad) {
                // Verificar stock primero
                Integer stock = consultarStockActual(productoId);
                if (stock < cantidad) {
                        throw new RuntimeException("Stock insuficiente. Disponible: " + stock);
                }

                // Llamamos a tu SP existente o lógica de descuento
                // Asumiendo que usas el repositorio de Lotes que ya tenías:
                loteRepository.registrarSalida(
                                productoId,
                                cantidad,
                                "MS-VENTAS", // Usuario responsable
                                1, // Sucursal Default
                                null,
                                "VENTA_EXTERNA",
                                false // Default: Unidad
                );
        }

        // 3. Reponer Inventario (Devolución)
        @Transactional
        public void reponerInventarioDevolucion(Integer productoId, Integer cantidad) {
                // Buscamos el último lote activo para sumarle ahí (simplificado)
                // O insertamos un movimiento de entrada
                String sqlLote = "SELECT id FROM lotes WHERE producto_id = ? ORDER BY fecha_vencimiento DESC LIMIT 1";
                try {
                        Integer loteId = jdbcTemplate.queryForObject(sqlLote, Integer.class, productoId);

                        // Insertamos el movimiento de retorno
                        String sqlInsert = "INSERT INTO movimientos (lote_id, tipo_movimiento, cantidad, usuario_responsable, sucursal_id, observaciones) "
                                        +
                                        "VALUES (?, 'DEVOLUCION', ?, 'MS-VENTAS', 1, 'Devolución de cliente')";

                        jdbcTemplate.update(sqlInsert, loteId, cantidad);

                        // NOTA: Asegúrate de que tu base de datos tenga un Trigger que actualice
                        // la tabla 'lotes' cuando se inserta en 'movimientos'.
                        // Si no tienes trigger, debes hacer el update manual aquí:
                        // jdbcTemplate.update("UPDATE lotes SET cantidad_actual = cantidad_actual + ?
                        // WHERE id = ?", cantidad, loteId);

                } catch (Exception e) {
                        throw new RuntimeException("No se encontró lote para procesar la devolución");
                }
        }

        @Transactional(readOnly = true) // <--- ESTO ES VITAL PARA QUE NO FALLE
        public DashboardAlertasDTO obtenerDashboardAlertas() {
                LocalDate hoy = LocalDate.now();

                // 1. OBTENER VENCIDOS
                List<Lote> lotesVencidos = loteRepository.findByFechaVencimientoBeforeAndCantidadActualGreaterThan(hoy,
                                0);

                List<Map<String, Object>> listaVencidos = lotesVencidos.stream()
                                .map(l -> Map.<String, Object>of(
                                                "id", l.getId(),
                                                "producto", l.getProducto().getNombreComercial(), // Requiere
                                                                                                  // transacción activa
                                                "lote", l.getNumeroLote(),
                                                "fecha", l.getFechaVencimiento(),
                                                "cantidad", l.getCantidadActual()))
                                .collect(java.util.stream.Collectors.toList()); // <--- CORRECCIÓN DE TIPO

                // 2. OBTENER POR VENCER
                List<Lote> lotesPorVencer = loteRepository
                                .findByFechaVencimientoBetweenAndCantidadActualGreaterThan(hoy, hoy.plusDays(30), 0);

                List<Map<String, Object>> listaPorVencer = lotesPorVencer.stream()
                                .map(l -> Map.<String, Object>of(
                                                "id", l.getId(),
                                                "producto", l.getProducto().getNombreComercial(),
                                                "lote", l.getNumeroLote(),
                                                "fecha", l.getFechaVencimiento(),
                                                "cantidad", l.getCantidadActual(),
                                                "diasRestantes",
                                                java.time.temporal.ChronoUnit.DAYS.between(hoy,
                                                                l.getFechaVencimiento())))
                                .collect(java.util.stream.Collectors.toList()); // <--- CORRECCIÓN DE TIPO

                // 3. OBTENER STOCK BAJO
                List<Producto> productosBajoStock = productoRepository.findProductosBajoStock();

                List<Map<String, Object>> listaStockBajo = productosBajoStock.stream()
                                .map(p -> {
                                        Integer stockReal = consultarStockActual(p.getId());
                                        return Map.<String, Object>of(
                                                        "id", p.getId(),
                                                        "nombre", p.getNombreComercial(),
                                                        "stockActual", stockReal,
                                                        "stockMinimo", p.getStockMinimo());
                                })
                                .collect(java.util.stream.Collectors.toList()); // <--- CORRECCIÓN DE TIPO

                // 4. CALCULAR SALUDABLES
                long totalProductos = productoRepository.count();
                long totalSaludables = Math.max(0, totalProductos - listaStockBajo.size());

                // 5. CONSTRUIR RESPUESTA
                return DashboardAlertasDTO.builder()
                                .totalVencidos(listaVencidos.size())
                                .totalPorVencer(listaPorVencer.size())
                                .totalStockBajo(listaStockBajo.size())
                                .totalSaludables(totalSaludables)
                                .listaVencidos(listaVencidos)
                                .listaPorVencer(listaPorVencer)
                                .listaStockBajo(listaStockBajo)
                                .build();
        }

}