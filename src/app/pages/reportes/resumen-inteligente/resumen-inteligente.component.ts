import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ReportesService } from '../../../core/services/reportes.service';
import { Periodicidad } from '../../../core/models/reportes.models';
import { PdfExportService } from '../../../core/services/pdf-export.service';

@Component({
  selector: 'app-resumen-inteligente',
  standalone: false,
  templateUrl: './resumen-inteligente.component.html',
  styleUrls: ['./resumen-inteligente.component.css']
})
export class ResumenInteligenteComponent implements OnInit {

  filtrosForm!: FormGroup;
  isAnalyzing: boolean = false;
  analisisResultado: string | null = null;
  errorMensaje: string | null = null;

  opcionesPeriodicidad: Periodicidad[] = ['DIARIO', 'SEMANAL', 'MENSUAL'];

  constructor(
    private fb: FormBuilder,
    private reportesService: ReportesService,
    private pdfExportService: PdfExportService
  ) { }

  ngOnInit(): void {
    // Inicializar formulario con fechas por defecto (ej. último mes)
    const hoy = new Date();
    const haceUnMes = new Date();
    haceUnMes.setMonth(hoy.getMonth() - 1);

    this.filtrosForm = this.fb.group({
      fechaInicio: [this.formatDate(haceUnMes), Validators.required],
      fechaFin: [this.formatDate(hoy), Validators.required],
      periodicidad: ['MENSUAL', Validators.required],
      sucursalId: [null],
      limite: ['Top 5']
    });
  }

  generarAnalisis(): void {
    if (this.filtrosForm.invalid) {
      this.filtrosForm.markAllAsTouched();
      return;
    }

    this.isAnalyzing = true;
    this.analisisResultado = null;
    this.errorMensaje = null;

    const filtros = this.filtrosForm.value;

    this.reportesService.getResumenInteligente(filtros).subscribe({
      next: (response) => {
        this.analisisResultado = response.resumenGenerado;
        this.isAnalyzing = false;
      },
      error: (err) => {
        console.error('Error al generar resumen:', err);
        this.errorMensaje = 'Ocurrió un error al intentar generar el resumen inteligente. Por favor, intente nuevamente.';
        this.isAnalyzing = false;
      }
    });
  }

  exportarPDF(): void {
    if (!this.analisisResultado) return;
    
    // 1. Limpieza de asteriscos dobles de markdown
    const textoLimpio = this.analisisResultado.replace(/\*\*/g, '');
    
    // 2. Obtener periodo para el PDF
    const { fechaInicio, fechaFin } = this.filtrosForm.value;
    const periodoStr = `${fechaInicio} al ${fechaFin}`;
    
    // 3. Nombre del archivo dinámico
    const nombreArchivo = `Resumen_IA_${fechaInicio}_${fechaFin}`;

    this.pdfExportService.exportarTextoPDF(
      'Resumen Ejecutivo Inteligente',
      textoLimpio,
      nombreArchivo,
      periodoStr
    );
  }

  // Utilidad para formatear fecha a YYYY-MM-DD
  private formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
}
