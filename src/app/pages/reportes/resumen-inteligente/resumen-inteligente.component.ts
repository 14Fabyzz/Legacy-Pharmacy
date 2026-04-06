import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ReportesService } from '../../../core/services/reportes.service';
import { Periodicidad, ResumenInteligenteResponse } from '../../../core/models/reportes.models';
import { ChartConfiguration, ChartData } from 'chart.js';
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

  async exportarPDF(): Promise<void> {
    const source = document.getElementById('dashboard-ia-export');
    if (!source) {
      console.error('PDF: No se encontró el contenido para exportar.');
      return;
    }

    const rawFiltros = this.filtrosForm.getRawValue();
    const fechaInicio = rawFiltros.fechaInicio || 'N/A';
    const fechaFin = rawFiltros.fechaFin || 'N/A';
    const nombreArchivo = 'Reporte_Ejecutivo_Regen_Salud_POS.pdf';

    // ── 1. Capturar contenido completo con html2canvas ────────────────
    //    onclone inyecta overrides de impresión en el clon INTERNO de
    //    html2canvas. Nunca se toca el DOM real de la aplicación.
    const fullCanvas = await html2canvas(source, {
      scale: 2,
      useCORS: true,
      scrollX: 0,
      scrollY: 0,
      windowWidth: 794,
      windowHeight: Math.max(source.scrollHeight, window.innerHeight) + 500,
      onclone: (clonedDoc: Document) => {
        // Eliminar TODA restricción de overflow en el documento clonado
        const printOverrides = clonedDoc.createElement('style');
        printOverrides.textContent = `
          html, body, app-root, .layout-wrapper, .main-content-wrapper,
          .content, .contenedor-reporte, .resultado-card,
          .card-body, #dashboard-ia-export, .analisis-content {
            height: auto !important;
            max-height: none !important;
            overflow: visible !important;
          }
        `;
        clonedDoc.head.appendChild(printOverrides);

        // Preparar el elemento para impresión
        const el = clonedDoc.getElementById('dashboard-ia-export');
        if (el) {
          el.style.width = '794px';
          el.style.padding = '24px';
          el.style.backgroundColor = '#ffffff';
          el.querySelectorAll<HTMLElement>('p, li, span, div, td, th')
            .forEach(n => n.style.fontSize = '10pt');
          el.querySelectorAll<HTMLElement>('table')
            .forEach(n => n.style.width = '100%');
        }
      },
    });

    // ── 2. Configurar PDF y márgenes ──────────────────────────────────
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pgW = pdf.internal.pageSize.getWidth();    // 210 mm
    const pgH = pdf.internal.pageSize.getHeight();   // 297 mm

    const margin = { top: 22, right: 15, bottom: 18, left: 15 };
    const areaW = pgW - margin.left - margin.right;  // 180 mm
    const areaH = pgH - margin.top - margin.bottom;  // 257 mm

    // ── 3. Calcular paginación ────────────────────────────────────────
    //    ratio = px del canvas por cada mm del PDF
    //    sliceH = altura en px de cada "rebanada" que cabe en una página
    const ratio = fullCanvas.width / areaW;
    const sliceH = Math.floor(areaH * ratio);
    const totalPages = Math.ceil(fullCanvas.height / sliceH);

    // ── 4. Generar cada página ────────────────────────────────────────
    for (let p = 0; p < totalPages; p++) {
      if (p > 0) pdf.addPage();

      const srcY = p * sliceH;
      const h = Math.min(sliceH, fullCanvas.height - srcY);

      // Recortar la porción del canvas maestro para esta página
      const pageSlice = document.createElement('canvas');
      pageSlice.width = fullCanvas.width;
      pageSlice.height = h;
      const ctx = pageSlice.getContext('2d')!;
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, pageSlice.width, pageSlice.height);
      ctx.drawImage(fullCanvas, 0, srcY, fullCanvas.width, h, 0, 0, fullCanvas.width, h);

      // Insertar como imagen respetando márgenes exactos
      const imgH = h / ratio;
      pdf.addImage(
        pageSlice.toDataURL('image/jpeg', 0.95),
        'JPEG', margin.left, margin.top, areaW, imgH
      );

      // ── Encabezado corporativo ──────────────────────────────────
      pdf.setFontSize(11);
      pdf.setTextColor(43, 52, 69);
      pdf.text('Regen Salud POS — Resumen Inteligente IA', margin.left, 10);
      pdf.setFontSize(8);
      pdf.setTextColor(120, 120, 120);
      pdf.text(`Periodo: ${fechaInicio} al ${fechaFin}`, margin.left, 14.5);
      pdf.setDrawColor(161, 140, 209);
      pdf.setLineWidth(0.5);
      pdf.line(margin.left, 17, pgW - margin.right, 17);

      // ── Pie de página con numeración ────────────────────────────
      pdf.setFontSize(7);
      pdf.setTextColor(160, 160, 160);
      pdf.text(
        `Página ${p + 1} de ${totalPages}`,
        pgW / 2, pgH - 8,
        { align: 'center' }
      );
    }

    pdf.save(nombreArchivo);
  }

  // Utilidad para formatear fecha a YYYY-MM-DD
  private formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
}
