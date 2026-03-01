import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'formatProduct',
    standalone: true
})
export class FormatProductPipe implements PipeTransform {

    transform(item: any, fallbackNameSource?: string): string {
        if (!item) return '';

        const cantidad = item.cantidad || 0;

        // Resolvemos el nombre del producto, manejando diferentes estructuras de DTO (ItemVentaDTO vs CartItem)
        let nombre = 'Producto Desconocido';
        if (item.nombreProducto) {
            nombre = item.nombreProducto;
        } else if (item.product && item.product.detalleProducto && item.product.detalleProducto.nombreComercial) {
            nombre = item.product.detalleProducto.nombreComercial;
        } else if (item.productoNombre) {
            nombre = item.productoNombre;
        } else if (fallbackNameSource) {
            // Extraer el nombre desde "1 x Nombre del Producto"
            // Buscamos la primera aparición de " x " (con espacios para evitar cortar nombres con X)
            const regexStr = `^${cantidad}\\s*x\\s*`;
            const regex = new RegExp(regexStr, 'i');
            nombre = fallbackNameSource.replace(regex, '').trim();
            // Por si el string era diferente, un pequeño fallback extra
            if (nombre === fallbackNameSource) {
                const parts = fallbackNameSource.split(' x ');
                if (parts.length > 1) {
                    // Quitamos la primera parte (cantidad) y unimos el resto si el nombre tiene X
                    parts.shift();
                    nombre = parts.join(' x ');
                }
            }
        }

        // Resolvemos el tipo de venta
        let esCaja = false;
        if (item.esVentaPorCaja === true) {
            esCaja = true;
        } else if (item.tipoVenta === 'CAJA') {
            esCaja = true;
        }

        if (esCaja) {
            return `${cantidad} Caja(s) de ${nombre}`;
        } else {
            return `${cantidad} Unidad(es) de ${nombre}`;
        }
    }

}
