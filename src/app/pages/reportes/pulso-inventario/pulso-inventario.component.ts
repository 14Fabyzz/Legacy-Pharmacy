import { Component, OnInit } from '@angular/core';
import { ReportesService } from '../../../core/services/reportes.service';
import { GestionInventarioMetricas } from '../../../core/models/reportes.models';

@Component({
  selector: 'app-pulso-inventario',
  standalone: false,
  templateUrl: './pulso-inventario.component.html',
  styleUrls: ['./pulso-inventario.component.css']
})
export class PulsoInventarioComponent implements OnInit {

  fechaInicio: string = '';
  fechaFin: string = '';
  sucursalId: number = 1;
  
  datosInventario?: GestionInventarioMetricas;
  isLoading: boolean = false;
  errorMensaje: string | null = null;

  constructor(private reportesService: ReportesService) { }

  ngOnInit(): void {
    // Relegado al (filterChanged) emitido por FilterBarComponent en la inicialización
  }

  onFilterChange(event: {fechaInicio: string, fechaFin: string}) {
    this.fechaInicio = event.fechaInicio;
    this.fechaFin = event.fechaFin;
    this.consultarMetricas();
  }

  consultarMetricas(): void {
    if (!this.fechaInicio || !this.fechaFin || !this.sucursalId) return;

    this.isLoading = true;
    this.errorMensaje = null;

    this.reportesService.obtenerPulsoInventario(this.fechaInicio, this.fechaFin, this.sucursalId)
      .subscribe({
        next: (data) => {
          this.datosInventario = data;
          this.isLoading = false;
        },
        error: (err) => {
          console.error('Error al obtener métricas de inventario', err);
          this.errorMensaje = 'Ocurrió un error al consultar las métricas. Intente nuevamente.';
          this.isLoading = false;
        }
      });
  }

  private formatDate(date: Date): string {
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const dd = String(date.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  }
}
