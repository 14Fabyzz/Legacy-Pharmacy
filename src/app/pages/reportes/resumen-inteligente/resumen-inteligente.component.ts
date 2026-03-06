import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ReportesService } from '../../../core/services/reportes.service';
import { Periodicidad } from '../../../core/models/reportes.models';
import { PdfExportService } from '../../../core/services/pdf-export.service';
import { ChartConfiguration, ChartData, ChartOptions } from 'chart.js';
import { TopProductoResponse } from '../../../core/models/reportes.models';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

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

  // Chart Properties
  public doughnutChartOptions: ChartConfiguration<'doughnut'>['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
      },
    },
  };
  public doughnutChartData: ChartData<'doughnut'> | null = null;

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

        if (response.topProductos && response.topProductos.length > 0) {
          const labels = response.topProductos.map(p => p.nombreProducto);
          const data = response.topProductos.map(p => p.ingresoGenerado);

          this.doughnutChartData = {
            labels: labels,
            datasets: [
              {
                data: data,
                label: 'Ingresos ($)',
                backgroundColor: [
                  '#4e73df', '#1cc88a', '#36b9cc', '#f6c23e', '#e74a3b',
                  '#858796', '#5a5c69', '#2e59d9', '#17a673', '#2c9faf'
                ]
              }
            ]
          };
        } else {
            this.doughnutChartData = null;
        }

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
    const data = document.getElementById('dashboard-ia-export');
    if (!data) return;
    
    const { fechaInicio, fechaFin } = this.filtrosForm.value;
    const nombreArchivo = `Dashboard_Inteligencia_Artificial.pdf`;

    html2canvas(data, { scale: 2 }).then(canvas => {
      const margin = 15;
      const pdf = new jsPDF('p', 'mm', 'a4'); 
      const position = 10;
      
      const imgWidth = pdf.internal.pageSize.getWidth() - (margin * 2);
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      const contentDataURL = canvas.toDataURL('image/png');
      
      pdf.setFontSize(14);
      pdf.text('Dashboard Híbrido - Inteligencia Artificial', margin, position);
      pdf.setFontSize(10);
      pdf.text(`Periodo: ${fechaInicio} al ${fechaFin}`, margin, position + 6);
      
      // La imagen va debajo de los textos, ajustamos el margen Y en 15 extra para que no pise el título
      pdf.addImage(contentDataURL, 'PNG', margin, position + margin, imgWidth, imgHeight);
      pdf.save(nombreArchivo);
    });
  }

  // Utilidad para formatear fecha a YYYY-MM-DD
  private formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
}
