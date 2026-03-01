import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ReportesService } from '../../../core/services/reportes.service';
import { ConsolidadoPagosResponse } from '../../../core/models/reportes.models';
import { HttpErrorResponse } from '@angular/common/http';
import { finalize } from 'rxjs/operators';

@Component({
  selector: 'app-consolidado-pagos',
  templateUrl: './consolidado-pagos.component.html',
  styleUrls: ['./consolidado-pagos.component.css'],
  standalone: false
})
export class ConsolidadoPagosComponent implements OnInit {

  filtrosForm: FormGroup;
  reporteData: ConsolidadoPagosResponse | null = null;
  isLoading = false;
  errorMessage = '';

  get totalCantidadVentas(): number {
    return this.reporteData?.metodosPago?.reduce((acc, curr) => acc + (curr.cantidadVentas || 0), 0) || 0;
  }

  constructor(
    private fb: FormBuilder,
    private reportesService: ReportesService
  ) {
    this.filtrosForm = this.fb.group({
      fechaInicio: ['', Validators.required],
      fechaFin: ['', Validators.required],
      sucursalId: ['']
    });
  }

  ngOnInit(): void {
    // Establecer fechas por defecto (ej. mes actual o día actual)
    const hoy = new Date();
    const parseDate = (d: Date) => {
      const month = ('0' + (d.getMonth() + 1)).slice(-2);
      const day = ('0' + d.getDate()).slice(-2);
      return `${d.getFullYear()}-${month}-${day}`;
    };
    const inicioMes = new Date(hoy.getFullYear(), hoy.getMonth(), 1);

    this.filtrosForm.patchValue({
      fechaInicio: parseDate(inicioMes),
      fechaFin: parseDate(hoy)
    });
  }

  generarReporte(): void {
    if (this.filtrosForm.invalid) {
      this.filtrosForm.markAllAsTouched();
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';
    this.reporteData = null;

    const { fechaInicio, fechaFin, sucursalId } = this.filtrosForm.value;
    const sucursal = sucursalId ? Number(sucursalId) : undefined;

    this.reportesService.getConsolidadoPagos(fechaInicio, fechaFin, sucursal)
      .pipe(finalize(() => this.isLoading = false))
      .subscribe({
        next: (data) => {
          this.reporteData = data;
        },
        error: (err: HttpErrorResponse) => {
          this.errorMessage = err.error?.message || 'Ocurrió un error al generar el reporte. Por favor, intente nuevamente.';
          console.error('Error fetching consolidado pagos:', err);
        }
      });
  }
}
