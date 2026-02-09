import { Component, OnInit } from '@angular/core';
import { VentaService } from '../../../core/services/venta.service';
import { TurnoCaja } from '../../../core/models/venta.models';

@Component({
    selector: 'app-estado-caja',
    templateUrl: './estado-caja.component.html',
    styleUrls: ['./estado-caja.component.css'],
    standalone: false
})
export class EstadoCajaComponent implements OnInit {
    turnoActual: TurnoCaja | null = null;
    isLoading: boolean = true;

    constructor(private ventaService: VentaService) { }

    ngOnInit(): void {
        this.checkStatus();
    }

    checkStatus() {
        this.isLoading = true;
        this.ventaService.verificarEstadoCaja().subscribe({
            next: (turno) => {
                this.turnoActual = turno;
                this.isLoading = false;
            },
            error: (err) => {
                console.error('Error al obtener estado de caja', err);
                this.isLoading = false;
            }
        });
    }

    get saldoActual(): number {
        if (!this.turnoActual) return 0;
        return (this.turnoActual.saldoInicial || 0) + (this.turnoActual.totalVentasTeorico || 0);
    }
}
