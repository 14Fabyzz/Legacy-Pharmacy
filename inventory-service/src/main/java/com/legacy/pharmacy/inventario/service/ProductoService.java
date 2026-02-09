package com.legacy.pharmacy.inventario.service;

import com.legacy.pharmacy.inventario.dto.ProductoDTO;
import com.legacy.pharmacy.inventario.entity.*;
import com.legacy.pharmacy.inventario.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.List;

@Service
public class ProductoService {

    @Autowired
    private ProductoRepository productoRepository;
    @Autowired
    private CategoriaRepository categoriaRepository;
    @Autowired
    private LaboratorioRepository laboratorioRepository;
    @Autowired
    private PrincipioActivoRepository principioActivoRepository;
    @Autowired
    private LoteRepository loteRepository;

    // --- PRODUCTOS ---

    public List<Producto> listarProductos(String estado) {
        if (estado != null) {
            return productoRepository.findByEstado(estado);
        }
        return productoRepository.findAll();
    }

    public Producto buscarPorId(Integer id) {
        return productoRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Producto no encontrado"));
    }

    public Producto buscarPorCodigoInterno(String codigo) {
        return productoRepository.findByCodigoInterno(codigo)
                .orElseThrow(() -> new RuntimeException("Código interno no existe"));
    }

    public Producto buscarPorCodigoBarras(String codigo) {
        return productoRepository.findByCodigoBarras(codigo)
                .orElseThrow(() -> new RuntimeException("Código de barras no existe"));
    }

    public List<Producto> buscarPorNombre(String texto) {
        return productoRepository.findByNombreComercialContainingIgnoreCase(texto);
    }

    public Producto guardarProducto(ProductoDTO dto) {
        Producto p = new Producto();
        // Mapeo manual (O usar MapStruct en el futuro)
        p.setCodigoInterno(dto.getCodigoInterno());
        p.setCodigoBarras(dto.getCodigoBarras());
        p.setNombreComercial(dto.getNombreComercial());
        p.setPrecioVentaBase(dto.getPrecioVentaBase());
        p.setStockMinimo(dto.getStockMinimo() != null ? dto.getStockMinimo() : 10);
        p.setEsControlado(dto.getEsControlado() != null ? dto.getEsControlado() : false);
        p.setRefrigerado(dto.getRefrigerado() != null ? dto.getRefrigerado() : false);
        p.setConcentracion(dto.getConcentracion());
        p.setPresentacion(dto.getPresentacion());
        p.setRegistroInvima(dto.getRegistroInvima());
        p.setEstado("ACTIVO");
        // Tipo de producto (TANGIBLE o SERVICIO)
        if (dto.getTipo() != null) {
            p.setTipo(com.legacy.pharmacy.inventario.entity.TipoProducto.valueOf(dto.getTipo()));
        } else {
            p.setTipo(com.legacy.pharmacy.inventario.entity.TipoProducto.TANGIBLE);
        }
        p.setEsFraccionable(dto.getEsFraccionable() != null ? dto.getEsFraccionable() : false);
        p.setUnidadesPorCaja(dto.getUnidadesPorCaja() != null ? dto.getUnidadesPorCaja() : 1);
        p.setUnidadesPorBlister(dto.getUnidadesPorBlister()); // Informativo para UX
        p.setPrecioVentaUnidad(dto.getPrecioVentaUnidad());
        p.setPrecioVentaBlister(dto.getPrecioVentaBlister());

        // Relaciones
        p.setCategoria(categoriaRepository.findById(dto.getCategoriaId()).orElseThrow());
        p.setLaboratorio(laboratorioRepository.findById(dto.getLaboratorioId()).orElseThrow());
        if (dto.getPrincipioActivoId() != null) {
            p.setPrincipioActivo(principioActivoRepository.findById(dto.getPrincipioActivoId()).orElse(null));
        }

        calcularPrecioUnitario(p, dto);
        return productoRepository.save(p);
    }

    public Producto actualizarProducto(Integer id, ProductoDTO dto) {
        Producto p = buscarPorId(id);

        // Actualizamos campos clave
        if (dto.getNombreComercial() != null)
            p.setNombreComercial(dto.getNombreComercial());
        if (dto.getPrecioVentaBase() != null)
            p.setPrecioVentaBase(dto.getPrecioVentaBase());
        if (dto.getCodigoInterno() != null)
            p.setCodigoInterno(dto.getCodigoInterno());
        if (dto.getCodigoBarras() != null)
            p.setCodigoBarras(dto.getCodigoBarras());
        if (dto.getConcentracion() != null)
            p.setConcentracion(dto.getConcentracion());
        if (dto.getPresentacion() != null)
            p.setPresentacion(dto.getPresentacion());
        if (dto.getRegistroInvima() != null)
            p.setRegistroInvima(dto.getRegistroInvima());
        if (dto.getStockMinimo() != null)
            p.setStockMinimo(dto.getStockMinimo());
        if (dto.getEsControlado() != null)
            p.setEsControlado(dto.getEsControlado());
        if (dto.getRefrigerado() != null)
            p.setRefrigerado(dto.getRefrigerado());

        // Actualizar tipo si viene en el DTO
        if (dto.getTipo() != null) {
            p.setTipo(com.legacy.pharmacy.inventario.entity.TipoProducto.valueOf(dto.getTipo()));
        }

        // Actualizamos campos de fraccionamiento
        if (dto.getEsFraccionable() != null)
            p.setEsFraccionable(dto.getEsFraccionable());
        if (dto.getUnidadesPorCaja() != null)
            p.setUnidadesPorCaja(dto.getUnidadesPorCaja());
        if (dto.getUnidadesPorBlister() != null)
            p.setUnidadesPorBlister(dto.getUnidadesPorBlister()); // Informativo para UX
        if (dto.getPrecioVentaUnidad() != null)
            p.setPrecioVentaUnidad(dto.getPrecioVentaUnidad());
        if (dto.getPrecioVentaBlister() != null)
            p.setPrecioVentaBlister(dto.getPrecioVentaBlister());

        // Actualizamos relaciones si vienen en el DTO
        if (dto.getCategoriaId() != null) {
            p.setCategoria(categoriaRepository.findById(dto.getCategoriaId()).orElseThrow());
        }
        if (dto.getLaboratorioId() != null) {
            p.setLaboratorio(laboratorioRepository.findById(dto.getLaboratorioId()).orElseThrow());
        }
        if (dto.getPrincipioActivoId() != null) {
            p.setPrincipioActivo(principioActivoRepository.findById(dto.getPrincipioActivoId()).orElse(null));
        }

        calcularPrecioUnitario(p, dto);
        return productoRepository.save(p);
    }

    public void cambiarEstado(Integer id, String nuevoEstado) {
        Producto p = buscarPorId(id);
        p.setEstado(nuevoEstado);
        productoRepository.save(p);
    }

    // --- LOTES ---

    public List<Lote> buscarLotesPorProducto(Integer productoId) {
        return loteRepository.findByProductoId(productoId);
    }

    public List<Lote> buscarLotesVencidos() {
        return loteRepository.findByFechaVencimientoBeforeAndCantidadActualGreaterThan(LocalDate.now(), 0);
    }

    public List<Lote> buscarLotesProximosVencer(int dias) {
        LocalDate hoy = LocalDate.now();
        LocalDate limite = hoy.plusDays(dias);
        return loteRepository.findByFechaVencimientoBetweenAndCantidadActualGreaterThan(hoy, limite, 0);
    }

    public Lote buscarLotePorId(Integer id) {
        return loteRepository.findById(id).orElseThrow(() -> new RuntimeException("Lote no encontrado"));
    }

    public List<Lote> obtenerLotesDisponiblesParaVenta(Integer productoId) {
        // Usamos 0 para traer cualquier lote que tenga al menos 1 unidad (Stock Real)
        // El repositorio ya se encarga de ordenar por fecha (FEFO)
        return loteRepository.findByProductoIdAndCantidadActualGreaterThanOrderByFechaVencimientoAsc(productoId, 0);
    }

    /**
     * Lógica Centralizada de Precios
     * 1. Si viene precio manual, se respeta.
     * 2. Si no, se calcula: Precio Caja / Unidades.
     * 3. Se protege contra división por cero.
     */
    private void calcularPrecioUnitario(Producto producto, ProductoDTO dto) {
        // 1. ESCENARIO MANUAL: Si el usuario envía precio, se respeta
        boolean precioUnidadManual = dto.getPrecioVentaUnidad() != null
                && dto.getPrecioVentaUnidad().compareTo(BigDecimal.ZERO) > 0;

        if (precioUnidadManual) {
            producto.setPrecioVentaUnidad(dto.getPrecioVentaUnidad());
        } else {
            // 2. ESCENARIO AUTOMÁTICO: Cálculo matemático
            if (Boolean.TRUE.equals(producto.getEsFraccionable())
                    && producto.getUnidadesPorCaja() != null
                    && producto.getUnidadesPorCaja() > 1) {

                // Validación de seguridad (Null safe)
                if (producto.getPrecioVentaBase() == null) {
                    producto.setPrecioVentaBase(BigDecimal.ZERO);
                }

                BigDecimal precioCaja = producto.getPrecioVentaBase();
                BigDecimal unidades = new BigDecimal(producto.getUnidadesPorCaja());

                // División con redondeo bancario a 2 decimales
                BigDecimal precioCalculado = precioCaja.divide(unidades, 2, RoundingMode.HALF_UP);

                producto.setPrecioVentaUnidad(precioCalculado);
            } else {
                // 3. ESCENARIO NO FRACCIONABLE (Unidad = Caja)
                producto.setPrecioVentaUnidad(producto.getPrecioVentaBase());
            }
        }

        // 4. LÓGICA PRECIO BLISTER (Modificado para soporte Blister)
        // a. Si viene manual, se respetó arriba (setPrecioVentaBlister en
        // guardar/actualizar)
        // Pero debemos asegurar que si NO viene manual, y tenemos unidadesPorBlister,
        // se calcule
        if (dto.getPrecioVentaBlister() == null && producto.getUnidadesPorBlister() != null
                && producto.getUnidadesPorBlister() > 0 && producto.getPrecioVentaUnidad() != null) {

            BigDecimal precioUnidad = producto.getPrecioVentaUnidad();
            BigDecimal factorBlister = new BigDecimal(producto.getUnidadesPorBlister());

            // Precio Sugerido = Precio Unidad * Unidades por Blister
            producto.setPrecioVentaBlister(precioUnidad.multiply(factorBlister));
        }
    }
}