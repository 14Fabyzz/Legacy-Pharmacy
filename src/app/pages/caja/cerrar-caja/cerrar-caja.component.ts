import { Component, OnInit } from '@angular/core';
import { VentaService } from '../../../core/services/venta.service';
import { TurnoCaja, CierreCajaDTO } from '../../../core/models/venta.models';
import { Router } from '@angular/router';

@Component({
    selector: 'app-cerrar-caja',
    templateUrl: './cerrar-caja.component.html',
    styleUrls: ['./cerrar-caja.component.css'],
    standalone: false
})
export class CerrarCajaComponent implements OnInit {
    turnoActual: TurnoCaja | null = null;
    totalEfectivoReal: number = 0;
    observaciones: string = '';
    diferencia: number = 0;
    isLoading: boolean = true;

    constructor(private ventaService: VentaService, private router: Router) { }

    ngOnInit(): void {
        this.checkStatus();
    }

    checkStatus() {
        this.isLoading = true;
        this.ventaService.verificarEstadoCaja().subscribe({
            next: (turno: TurnoCaja) => {
                this.turnoActual = turno;
                this.isLoading = false;
                if (this.turnoActual) {
                    this.calculateDifference();
                }
            },
            error: (err: any) => {
                console.error('Error al verificar estado de caja', err);
                this.isLoading = false;
            }
        });
    }

    calculateDifference() {
        if (this.turnoActual) {
            const teorico = (this.turnoActual.saldoInicial || 0) + (this.turnoActual.totalVentasTeorico || 0);
            this.diferencia = this.totalEfectivoReal - teorico;
        }
    }

    cerrarTurno() {
        if (!this.turnoActual) return;

        if (confirm('¿Estás seguro de que deseas cerrar el turno de caja?')) {
            const dto: CierreCajaDTO = {
                totalEfectivoReal: this.totalEfectivoReal,
                observaciones: this.observaciones
            };

            this.isLoading = true;
            this.ventaService.cerrarCaja(dto).subscribe({
                next: (res: TurnoCaja) => {
                    this.isLoading = false;
                    alert('Caja cerrada con éxito');
                    this.router.navigate(['/app/caja/abrir']);
                },
                error: (err: any) => {
                    console.error('Error al cerrar caja', err);
                    this.isLoading = false;
                    const msg = err.error?.message || err.error || 'No se pudo cerrar la caja';
                    alert(msg);
                }
            });
        }
    }
}
