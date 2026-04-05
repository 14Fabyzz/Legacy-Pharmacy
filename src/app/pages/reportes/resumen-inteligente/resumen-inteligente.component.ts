import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ReportesService } from '../../../core/services/reportes.service';
import { Periodicidad, ResumenInteligenteResponse } from '../../../core/models/reportes.models';
import { PdfExportService } from '../../../core/services/pdf-export.service';
import { ChartConfiguration, ChartData, ChartOptions } from 'chart.js';
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
  resumenData?: ResumenInteligenteResponse;
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

  opcionesPeriodicidad: Periodicidad[] = ['DIARIO', 'SEMANAL', 'MENSUAL', 'PERSONALIZADO'];

  constructor(
    private fb: FormBuilder,
    private reportesService: ReportesService,
    private pdfExportService: PdfExportService
  ) { }

  ngOnInit(): void {
    const hoy = new Date();
    const inicioMes = new Date(hoy.getFullYear(), hoy.getMonth(), 1);

    this.filtrosForm = this.fb.group({
      fechaInicio: [{ value: this.formatDate(inicioMes), disabled: true }, Validators.required],
      fechaFin: [{ value: this.formatDate(hoy), disabled: true }, Validators.required],
      periodicidad: ['MENSUAL', Validators.required],
      sucursalId: [1],
      limite: ['Top 5']
    });

    this.filtrosForm.get('periodicidad')?.valueChanges.subscribe(val => {
      const fechaActual = new Date();
      if (val === 'DIARIO') {
        this.filtrosForm.patchValue({
          fechaInicio: this.formatDate(fechaActual),
          fechaFin: this.formatDate(fechaActual)
        });
        this.filtrosForm.get('fechaInicio')?.disable();
        this.filtrosForm.get('fechaFin')?.disable();
      } else if (val === 'SEMANAL') {
        const inicioSemana = new Date();
        inicioSemana.setDate(fechaActual.getDate() - 7);
        this.filtrosForm.patchValue({
          fechaInicio: this.formatDate(inicioSemana),
          fechaFin: this.formatDate(fechaActual)
        });
        this.filtrosForm.get('fechaInicio')?.disable();
        this.filtrosForm.get('fechaFin')?.disable();
      } else if (val === 'MENSUAL') {
        const iMes = new Date(fechaActual.getFullYear(), fechaActual.getMonth(), 1);
        this.filtrosForm.patchValue({
          fechaInicio: this.formatDate(iMes),
          fechaFin: this.formatDate(fechaActual)
        });
        this.filtrosForm.get('fechaInicio')?.disable();
        this.filtrosForm.get('fechaFin')?.disable();
      } else if (val === 'PERSONALIZADO') {
        this.filtrosForm.get('fechaInicio')?.enable();
        this.filtrosForm.get('fechaFin')?.enable();
      }
    });
  }

  generarAnalisis(): void {
    if (this.filtrosForm.invalid) {
      this.filtrosForm.markAllAsTouched();
      return;
    }

    this.isAnalyzing = true;
    this.resumenData = undefined;
    this.errorMensaje = null;

    const filtros = this.filtrosForm.getRawValue();

    this.reportesService.generarResumenInteligente(
      filtros.fechaInicio, 
      filtros.fechaFin, 
      filtros.sucursalId || 1
    ).subscribe({
      next: (response: ResumenInteligenteResponse) => {
        this.resumenData = response;

        // Ya no tenemos topProductos en la respuesta, por ahora limpiamos el chart
        this.doughnutChartData = null;

        this.isAnalyzing = false;
      },
      error: (err: any) => {
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
