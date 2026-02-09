import { Component, OnInit } from '@angular/core';
import { VentaService } from '../../../core/services/venta.service';
import { AuthService } from '../../../core/services/auth.service';
import { TurnoCaja, AperturaCajaDTO } from '../../../core/models/venta.models';

@Component({
    selector: 'app-abrir-caja',
    templateUrl: './abrir-caja.component.html',
    styleUrls: ['./abrir-caja.component.css'],
    standalone: false
})
export class AbrirCajaComponent implements OnInit {
    turnoActual: TurnoCaja | null = null;
    saldoInicial: number = 0;
    isLoading: boolean = true;

    constructor(
        private ventaService: VentaService,
        private authService: AuthService
    ) { }

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
                console.error('Error al verificar estado de caja', err);
                this.isLoading = false;
            }
        });
    }

    abrirTurno() {
        if (this.saldoInicial < 0) {
            alert('El saldo inicial no puede ser negativo');
            return;
        }

        // Obtenemos el usuario actual para sacar su sucursal
        const user = JSON.parse(localStorage.getItem('currentUser') || '{}');
        const sucursalId = user.sucursalId || 1; // Prioridad al dato del usuario

        const dto: AperturaCajaDTO = {
            saldoInicial: this.saldoInicial,
            sucursalId: sucursalId
        };

        console.log('Enviando petición de apertura de caja:', dto);

        this.isLoading = true;
        this.ventaService.abrirCaja(dto).subscribe({
            next: (nuevoTurno) => {
                this.turnoActual = nuevoTurno;
                this.isLoading = false;
                alert('Caja abierta con éxito');
            },
            error: (err) => {
                console.error('Error al abrir caja', err);
                this.isLoading = false;
                const msg = err.error?.message || err.error || 'No se pudo abrir la caja';
                alert(msg);
            }
        });
    }
}
