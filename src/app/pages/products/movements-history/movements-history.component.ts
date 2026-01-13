import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

export interface AuditoriaItem {
    fecha: Date;
    tipo: 'ENTRADA' | 'SALIDA' | 'AJUSTE' | 'DEVOLUCION';
    cantidad: number;
    documento_ref: string;
    usuario_nombre: string;
    usuario_avatar?: string;
    producto_nombre: string;
    producto_lote: string;
    producto_foto?: string;
}

@Component({
    selector: 'app-movements-history',
    standalone: true,
    imports: [CommonModule, RouterModule],
    templateUrl: './movements-history.component.html',
    styleUrls: ['./movements-history.component.css']
})
export class MovementsHistoryComponent implements OnInit {
    movimientos: AuditoriaItem[] = [];
    loading = true;

    constructor() { }

    ngOnInit(): void {
        this.generateMockData();
    }

    generateMockData() {
        this.movimientos = [
            {
                fecha: new Date(),
                tipo: 'ENTRADA',
                cantidad: 150,
                documento_ref: 'COM-001',
                usuario_nombre: 'Carlos Ruiz',
                producto_nombre: 'Acetaminofén 500mg',
                producto_lote: 'L-2023001'
            },
            {
                fecha: new Date(new Date().setHours(new Date().getHours() - 2)),
                tipo: 'SALIDA',
                cantidad: -5,
                documento_ref: 'FAC-1024',
                usuario_nombre: 'Ana Gomez',
                producto_nombre: 'Ibuprofeno 400mg',
                producto_lote: 'L-2023055'
            },
            {
                fecha: new Date(new Date().setHours(new Date().getHours() - 5)),
                tipo: 'AJUSTE',
                cantidad: -2,
                documento_ref: 'AJU-099',
                usuario_nombre: 'Admin Sistema',
                producto_nombre: 'Amoxicilina 500mg',
                producto_lote: 'L-2023101'
            },
            {
                fecha: new Date(new Date().setHours(new Date().getHours() - 24)),
                tipo: 'DEVOLUCION',
                cantidad: 1,
                documento_ref: 'NCRE-055',
                usuario_nombre: 'Luisa Fer',
                producto_nombre: 'Loratadina 10mg',
                producto_lote: 'L-2023222'
            },
            {
                fecha: new Date(new Date().setHours(new Date().getHours() - 26)),
                tipo: 'SALIDA',
                cantidad: -12,
                documento_ref: 'FAC-1020',
                usuario_nombre: 'Ana Gomez',
                producto_nombre: 'Acetaminofén 500mg',
                producto_lote: 'L-2023001'
            }
        ];
        this.loading = false;
    }
}
