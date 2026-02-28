import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ReportesService } from '../../../core/services/reportes.service';
import { TopProductoResponse } from '../../../core/models/reportes.models';

@Component({
  selector: 'app-top-rotacion',
  templateUrl: './top-rotacion.component.html',
  styleUrls: ['./top-rotacion.component.css'],
  standalone: false
})
export class TopRotacionComponent implements OnInit {

  filtroForm: FormGroup;
  topProductos: TopProductoResponse[] = [];
  isLoading: boolean = false;
  error: string | null = null;
  hasSearched: boolean = false;

  opcionesLimite = [
    { label: 'Top 10', value: 10 },
    { label: 'Top 20', value: 20 },
    { label: 'Todos', value: null }
  ];

  constructor(
    private fb: FormBuilder,
    private reportesService: ReportesService
  ) {
    this.filtroForm = this.fb.group({
      fechaInicio: ['', Validators.required],
      fechaFin: ['', Validators.required],
      limite: [10] // Default Top 10
    });
  }

  ngOnInit(): void {
    const hoy = new Date();
    const haceUnMes = new Date();
    haceUnMes.setMonth(hoy.getMonth() - 1);

    this.filtroForm.patchValue({
      fechaInicio: haceUnMes.toISOString().split('T')[0],
      fechaFin: hoy.toISOString().split('T')[0]
    });
  }

  generarReporte() {
    if (this.filtroForm.invalid) {
      this.filtroForm.markAllAsTouched();
      return;
    }

    this.isLoading = true;
    this.error = null;
    this.hasSearched = true;

    const { fechaInicio, fechaFin, limite } = this.filtroForm.value;

    this.reportesService.getTopRotacion(fechaInicio, fechaFin, limite).subscribe({
      next: (data) => {
        this.topProductos = data;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error al generar reporte:', err);
        this.error = 'Ocurrió un error al cargar el reporte. Por favor, intenta nuevamente.';
        this.isLoading = false;
      }
    });
  }
}
