import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

interface MovimientoGlobal {
    fecha: Date;
    tipo: 'ENTRADA' | 'SALIDA' | 'AJUSTE';
    cantidad: number;
    documento_ref: string;
    usuario: string;
    // Audit fields
    producto_nombre: string;
    producto_foto: string;
    producto_lote: string;
}

@Component({
    selector: 'app-movements-history',
    standalone: true,
    imports: [CommonModule, RouterModule],
    templateUrl: './movements-history.component.html',
    styleUrls: ['./movements-history.component.css']
})
export class MovementsHistoryComponent implements OnInit {
    movimientos: MovimientoGlobal[] = [];
    loading = true;

    constructor() { }

    ngOnInit(): void {
        // Simulate API delay
        setTimeout(() => {
            this.generateMockData();
            this.loading = false;
        }, 500);
    }

    generateMockData() {
        const products = [
            { name: 'Acetaminofén 500mg', lote: 'L-2023001' },
            { name: 'Ibuprofeno 400mg', lote: 'L-2023055' },
            { name: 'Amoxicilina 500mg', lote: 'L-2023101' },
            { name: 'Loratadina 10mg', lote: 'L-2023222' },
            { name: 'Omeprazol 20mg', lote: 'L-2023333' },
            { name: 'Gasas Estériles', lote: 'L-GASA-01' },
            { name: 'Alcohol Antiséptico', lote: 'L-ALC-99' }
        ];

        const users = ['Admin', 'Vendedor 1', 'Vendedor 2', 'Supervisor'];
        const types: ('ENTRADA' | 'SALIDA' | 'AJUSTE')[] = ['ENTRADA', 'SALIDA', 'SALIDA', 'SALIDA', 'AJUSTE'];

        this.movimientos = Array.from({ length: 20 }, (_, i) => {
            const prod = products[Math.floor(Math.random() * products.length)];
            const type = types[Math.floor(Math.random() * types.length)];

            // Random time today/yesterday
            const date = new Date();
            date.setHours(date.getHours() - Math.floor(Math.random() * 48));

            return {
                fecha: date,
                tipo: type,
                cantidad: Math.floor(Math.random() * 50) + 1,
                documento_ref: `${type.substring(0, 3)}-${1000 + i}`,
                usuario: users[Math.floor(Math.random() * users.length)],
                producto_nombre: prod.name,
                producto_foto: '', // Placeholder in HTML
                producto_lote: prod.lote
            };
        }).sort((a, b) => b.fecha.getTime() - a.fecha.getTime());
    }
}
