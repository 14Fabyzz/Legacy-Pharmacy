package com.legacy.pharmacy.inventario.controller;

import com.legacy.pharmacy.inventario.dto.ProductoDTO;
import com.legacy.pharmacy.inventario.dto.StockDTO;
import com.legacy.pharmacy.inventario.entity.Lote;
import com.legacy.pharmacy.inventario.entity.Producto;
import com.legacy.pharmacy.inventario.service.InventarioService;
import com.legacy.pharmacy.inventario.service.ProductoService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("")
public class ProductoController {

    @Autowired
    private ProductoService productoService;

    @Autowired
    private InventarioService inventarioService;

    @Autowired
    private com.legacy.pharmacy.inventario.service.MovimientoService movimientoService;

    // --- RUTAS DE PRODUCTOS ---

    // GET /productos (Opcional ?estado=ACTIVO)
    @GetMapping("/productos")
    public ResponseEntity<List<Producto>> listarProductos(@RequestParam(required = false) String estado) {
        return ResponseEntity.ok(productoService.listarProductos(estado));
    }

    @GetMapping("/productos/{id}")
    public ResponseEntity<Producto> buscarPorId(@PathVariable Integer id) {
        return ResponseEntity.ok(productoService.buscarPorId(id));
    }

    @GetMapping("/productos/codigo/{codigoInterno}")
    public ResponseEntity<Producto> buscarPorCodigo(@PathVariable String codigoInterno) {
        return ResponseEntity.ok(productoService.buscarPorCodigoInterno(codigoInterno));
    }

    @GetMapping("/productos/barras/{codigoBarras}")
    public ResponseEntity<Producto> buscarPorBarras(@PathVariable String codigoBarras) {
        return ResponseEntity.ok(productoService.buscarPorCodigoBarras(codigoBarras));
    }

    @GetMapping("/productos/buscar")
    public ResponseEntity<List<Producto>> buscarPorNombre(@RequestParam String nombre) {
        return ResponseEntity.ok(productoService.buscarPorNombre(nombre));
    }

    @PostMapping("/productos")
    public ResponseEntity<Producto> crearProducto(@RequestBody @Valid ProductoDTO dto) {
        return ResponseEntity.ok(productoService.guardarProducto(dto));
    }

    @PutMapping("/productos/{id}")
    public ResponseEntity<Producto> actualizarProducto(@PathVariable Integer id, @RequestBody @Valid ProductoDTO dto) {
        return ResponseEntity.ok(productoService.actualizarProducto(id, dto));
    }

    @PatchMapping("/productos/{id}/estado")
    public ResponseEntity<?> cambiarEstado(@PathVariable Integer id, @RequestParam String nuevoEstado) {
        productoService.cambiarEstado(id, nuevoEstado);
        return ResponseEntity.ok(Map.of("mensaje", "Estado actualizado a " + nuevoEstado));
    }

    // --- KARDEX (MOVIMIENTOS) ---
    @GetMapping("/productos/{id}/kardex")
    public ResponseEntity<List<com.legacy.pharmacy.inventario.dto.MovimientoKardexDTO>> verKardexProducto(
            @PathVariable Integer id) {
        return ResponseEntity.ok(movimientoService.obtenerKardexProducto(id));
    }

    // --- RUTAS DE LOTES (CONSULTAS) ---

    @GetMapping("/lotes/producto/{productoId}")
    public ResponseEntity<List<Lote>> verLotesProducto(@PathVariable Integer productoId) {
        return ResponseEntity.ok(productoService.buscarLotesPorProducto(productoId));
    }

    @GetMapping("/lotes/vencidos")
    public ResponseEntity<List<Lote>> verLotesVencidos() {
        return ResponseEntity.ok(productoService.buscarLotesVencidos());
    }

    @GetMapping("/lotes/proximos-vencer")
    public ResponseEntity<List<Lote>> verProximosVencer(@RequestParam(defaultValue = "90") int dias) {
        return ResponseEntity.ok(productoService.buscarLotesProximosVencer(dias));
    }

    @GetMapping("/lotes/{loteId}")
    public ResponseEntity<Lote> verLotePorId(@PathVariable Integer loteId) {
        return ResponseEntity.ok(productoService.buscarLotePorId(loteId));
    }

    /**
     * ===================================================================
     * NUEVOS ENDPOINTS PARA INTEGRACIÓN CON MS-VENTAS
     * ===================================================================
     */

    /**
     * Consultar stock disponible de un producto
     * 
     * @param productoId ID del producto
     * @param sucursalId ID de la sucursal (opcional, para filtrar stock por
     *                   sucursal)
     */
    @GetMapping("/productos/{productoId}/stock")
    public ResponseEntity<StockDTO> consultarStock(
            @PathVariable Integer productoId,
            @RequestParam(required = false) Integer sucursalId) {
        return ResponseEntity.ok(inventarioService.consultarStock(productoId, sucursalId));
    }

    /**
     * Descontar inventario (llamado por MS-Ventas)
     * Usa el procedimiento almacenado sp_descontar_inventario
     */
    @PostMapping("/productos/{productoId}/descontar")
    public ResponseEntity<?> descontarInventario(
            @PathVariable Integer productoId,
            @RequestBody DescontarRequest request) {

        inventarioService.descontarInventario(
                productoId,
                request.cantidad(),
                request.motivo(),
                request.esVentaPorCaja() != null ? request.esVentaPorCaja() : false);

        return ResponseEntity.ok(Map.of(
                "mensaje", "Inventario descontado exitosamente",
                "productoId", productoId,
                "cantidad", request.cantidad()));
    }

    /**
     * Devolver inventario (cuando se anula una venta)
     * Usa el procedimiento almacenado sp_registrar_entrada
     */
    @PostMapping("/productos/{productoId}/devolver")
    public ResponseEntity<?> devolverInventario(
            @PathVariable Integer productoId,
            @RequestBody DevolverRequest request) {

        inventarioService.devolverInventario(
                productoId,
                request.cantidad(),
                request.motivo());

        return ResponseEntity.ok(Map.of(
                "mensaje", "Inventario devuelto exitosamente",
                "productoId", productoId,
                "cantidad", request.cantidad()));
    }

    // DTOs
    public record DescontarRequest(Integer cantidad, String motivo, Boolean esVentaPorCaja) {
    }

    public record DevolverRequest(Integer cantidad, String motivo) {
    }
}
