import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';

interface MovimientoKardex {
    fecha: Date;
    tipo: 'ENTRADA' | 'SALIDA' | 'AJUSTE';
    cantidad: number;
    saldo_resultante: number;
    documento_ref: string;
    usuario: string;
    // Detalle extra
    motivo?: string;
    proveedor?: string;
    cliente?: string;
    notas?: string;
    usuario_autoriza?: string;
    lote?: string;
}

@Component({
    selector: 'app-kardex',
    standalone: true,
    imports: [CommonModule, RouterModule],
    templateUrl: './kardex.component.html',
    styleUrls: ['./kardex.component.css']
})
export class KardexComponent implements OnInit {
    productId: number | null = null;
    product: any = null; // Mock product info
    movimientos: MovimientoKardex[] = [];
    selectedMovement: MovimientoKardex | null = null;

    constructor(private route: ActivatedRoute) { }

    ngOnInit(): void {
        this.route.params.subscribe(params => {
            // Si viene parámetro, lo usamos. Si no (desde sidebar), usamos ID 15 por defecto para demo.
            this.productId = params['id'] ? +params['id'] : 15;
            this.loadKardexData(this.productId);
        });
    }

    loadKardexData(id: number) {
        // Mock Data Simulation
        this.product = {
            id: id,
            nombre: 'Acetaminofén 500mg', // Mock name
            codigo_barras: '77020356894', // Mock barcode
            stock_actual: 150
        };

        // Generating mock movements
        this.movimientos = [
            {
                fecha: new Date('2025-10-25T08:30:00'),
                tipo: 'ENTRADA',
                cantidad: 100,
                saldo_resultante: 100,
                documento_ref: 'FAC-001',
                usuario: 'Admin',
                proveedor: 'Laboratorios MK',
                lote: 'L-2023001',
                notas: 'Entrada inicial de inventario.'
            },
            {
                fecha: new Date('2025-10-26T14:15:00'),
                tipo: 'SALIDA',
                cantidad: 20,
                saldo_resultante: 80,
                documento_ref: 'VTA-102',
                usuario: 'Vendedor 1',
                cliente: 'Juan Pérez',
                motivo: 'Venta Mostrador'
            },
            {
                fecha: new Date('2025-10-28T09:00:00'),
                tipo: 'ENTRADA',
                cantidad: 50,
                saldo_resultante: 130,
                documento_ref: 'FAC-005',
                usuario: 'Admin',
                proveedor: 'Drogería Principal',
                lote: 'L-2023999'
            },
            {
                fecha: new Date('2025-10-30T11:45:00'),
                tipo: 'AJUSTE',
                cantidad: 5,
                saldo_resultante: 125,
                documento_ref: 'AJ-001',
                usuario: 'Supervisor',
                motivo: 'Avería en transporte',
                notas: 'Se rompieron 5 cajas durante la descarga.',
                usuario_autoriza: 'Gerente'
            },
            {
                fecha: new Date('2025-11-01T16:20:00'),
                tipo: 'SALIDA',
                cantidad: 15,
                saldo_resultante: 110,
                documento_ref: 'VTA-155',
                usuario: 'Vendedor 2',
                cliente: 'María López'
            }
        ];

        // Sort descending by date (newest first)
        this.movimientos.sort((a, b) => b.fecha.getTime() - a.fecha.getTime());
    }

    openDetail(movement: MovimientoKardex) {
        this.selectedMovement = movement;
    }

    closeDetail() {
        this.selectedMovement = null;
    }

    simulateMovement() {
        const types: ('ENTRADA' | 'SALIDA' | 'AJUSTE')[] = ['ENTRADA', 'SALIDA', 'SALIDA', 'SALIDA', 'AJUSTE']; // Más probabilidad de venta
        const type = types[Math.floor(Math.random() * types.length)];

        let cantidad = 0;
        let documento = '';
        let saldo = this.movimientos[0]?.saldo_resultante || 0; // Usar último saldo conocido
        let detailData: any = {};

        if (type === 'ENTRADA') {
            cantidad = Math.floor(Math.random() * 50) + 10;
            saldo += cantidad;
            documento = `FAC-SIM-${Math.floor(Math.random() * 9000)}`;
            detailData = {
                proveedor: 'Distribuidora Simulación SAS',
                lote: `L-SIM-${Math.floor(Math.random() * 999)}`,
                notas: 'Movimiento generado automáticamente por simulación.'
            };
        } else if (type === 'SALIDA') {
            cantidad = Math.floor(Math.random() * 5) + 1; // Ventas pequeñas
            saldo -= cantidad;
            documento = `VTA-SIM-${Math.floor(Math.random() * 9000)}`;
            detailData = {
                cliente: 'Cliente Mostrador (Simulado)',
                motivo: 'Venta Directa'
            };
        } else {
            // Ajuste
            cantidad = Math.floor(Math.random() * 3) + 1;
            // Ajuste negativo (pérdida) o positivo: simularemos negativo
            const esPerdida = Math.random() > 0.5;
            if (esPerdida) {
                saldo -= cantidad;
                detailData = {
                    motivo: 'Avería simulada',
                    notas: 'Producto dañado en estantería',
                    usuario_autoriza: 'Supervisor'
                };
            } else {
                saldo += cantidad;
                detailData = {
                    motivo: 'Hallazgo de inventario',
                    notas: 'Sobrante encontrado'
                };
            }
            documento = `AJ-SIM-${Math.floor(Math.random() * 9000)}`;
        }

        const newMovement: MovimientoKardex = {
            fecha: new Date(),
            tipo: type,
            cantidad: cantidad,
            saldo_resultante: saldo,
            documento_ref: documento,
            usuario: 'Sistema (Bot)',
            ...detailData
        };

        // Add to top
        this.movimientos.unshift(newMovement);

        // Update product stock display
        if (this.product) {
            this.product.stock_actual = saldo;
        }

        // Show toast/alert (optional, let's just highlight the row in future)
    }
}
