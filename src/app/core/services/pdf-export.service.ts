import { Injectable } from '@angular/core';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

@Injectable({
  providedIn: 'root'
})
export class PdfExportService {

  constructor() { }

  /**
   * Genera y descarga un PDF con una tabla de datos.
   * @param tituloReporte El título que aparecerá en la parte superior del PDF.
   * @param columnas Arreglo de strings con los nombres de las columnas.
   * @param filas Arreglo de arreglos con los datos (filas de la tabla).
   * @param nombreArchivo El nombre sugerido para el archivo PDF a descargar.
   * @param periodo Rango de fechas o periodo consultado, opcional.
   */
  exportarTablaPDF(tituloReporte: string, columnas: string[], filas: any[][], nombreArchivo: string, periodo?: string) {
    // Inicializar jsPDF (orientación portrait, unidad milímetros, formato A4)
    const doc = new jsPDF('p', 'mm', 'a4');

    // Configuración de colores corporativos (Legacy Pharmacy suele ser azul oscuro / tonos médicos)
    const headerColor: [number, number, number] = [28, 43, 72]; // Un azul oscuro (ajustar si es necesario)
    const titleColor: [number, number, number] = [30, 30, 30];

    // 1. Título del Reporte
    doc.setFontSize(18);
    doc.setTextColor(...titleColor);
    // Centrar el texto (ancho de A4 es 210mm)
    const textWidth = doc.getTextWidth(tituloReporte);
    doc.text(tituloReporte, (210 - textWidth) / 2, 20);

    let startY = 30;

    // 2. Período Consultado (Opcional)
    if (periodo) {
      doc.setFontSize(11);
      doc.setTextColor(100, 100, 100);
      const periodoText = `Período: ${periodo}`;
      const perWidth = doc.getTextWidth(periodoText);
      doc.text(periodoText, (210 - perWidth) / 2, startY);
      startY += 10;
    }

    // 3. Tabla con autoTable
    autoTable(doc, {
      startY: startY,
      head: [columnas],
      body: filas,
      theme: 'grid',
      headStyles: {
        fillColor: headerColor,
        textColor: [255, 255, 255],
        fontStyle: 'bold',
        halign: 'center'
      },
      styles: {
        fontSize: 9,
        cellPadding: 3
      },
      alternateRowStyles: {
        fillColor: [245, 245, 245]
      },
      // 4. Pie de página (Fecha y Hora de generación)
      didDrawPage: function (data: any) {
        // Formatear la fecha actual
        const now = new Date();
        const fechaStr = now.toLocaleDateString() + ' ' + now.toLocaleTimeString();
        doc.setFontSize(9);
        doc.setTextColor(150, 150, 150);

        // Agregar footer centrado o a la derecha (aquí va a la derecha)
        const footerText = `Generado el: ${fechaStr} - Página ${doc.getCurrentPageInfo().pageNumber}`;
        const footerWidth = doc.getTextWidth(footerText);
        // Margen inferior ~ 10mm
        doc.text(footerText, 210 - data.settings.margin.right - footerWidth, doc.internal.pageSize.height - 10);
      }
    });

    // 5. Descargar el archivo
    doc.save(`${nombreArchivo}.pdf`);
  }
  /**
   * Genera y descarga un PDF con texto narrativo largo.
   * Útil para exportar análisis o resúmenes ejecutivos.
   */
  exportarTextoPDF(titulo: string, textoBase: string, nombreArchivo: string, periodo: string) {
    const doc = new jsPDF('p', 'mm', 'a4');
    const titleColor: [number, number, number] = [30, 30, 30];
    
    // 1. Título centrado
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...titleColor);
    const textWidth = doc.getTextWidth(titulo);
    doc.text(titulo, (210 - textWidth) / 2, 20);

    // 2. Subtítulo (Período)
    let startY = 30;
    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 100, 100);
    const periodoText = `Período: ${periodo}`;
    const perWidth = doc.getTextWidth(periodoText);
    doc.text(periodoText, (210 - perWidth) / 2, startY);
    
    // 3. Cuerpo del texto (división inteligente)
    startY += 15;
    doc.setFontSize(11);
    doc.setTextColor(40, 40, 40);
    
    // Divide el texto respetando los márgenes (180mm de ancho útil aprox)
    const lineasTexto = doc.splitTextToSize(textoBase, 180);
    
    // Escribe el texto con iterador para manejar múltiples hojas si fuera muy largo
    // (Por simplicidad asumo que cabe en 1 hoja, jsPDF.text() maneja arreglos de string)
    doc.text(lineasTexto, 15, startY);

    // 4. Pie de página
    const now = new Date();
    const fechaStr = now.toLocaleDateString() + ' ' + now.toLocaleTimeString();
    doc.setFontSize(9);
    doc.setTextColor(150, 150, 150);
    const footerText = `Generado el: ${fechaStr} - Página 1`;
    const footerWidth = doc.getTextWidth(footerText);
    doc.text(footerText, 210 - 15 - footerWidth, doc.internal.pageSize.height - 10);

    // 5. Descargar
    doc.save(nombreArchivo);
  }
}
