import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BaseChartDirective } from 'ng2-charts';

import { ReportesRoutingModule } from './reportes-routing.module';
import { ReportesComponent } from './reportes.component';
import { ResumenInteligenteComponent } from './resumen-inteligente/resumen-inteligente.component';
import { MarkdownBoldPipe } from '../../shared/pipes/markdown-bold.pipe';
import { PulsoInventarioComponent } from './pulso-inventario/pulso-inventario.component';
import { MotorVentasComponent } from './motor-ventas/motor-ventas.component';
import { DetalleReporteComponent } from './detalle-reporte/detalle-reporte.component';

@NgModule({
    declarations: [
        ReportesComponent,
        ResumenInteligenteComponent,
        PulsoInventarioComponent,
        MotorVentasComponent,
        DetalleReporteComponent
    ],
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        ReportesRoutingModule,
        BaseChartDirective,
        MarkdownBoldPipe
    ]
})
export class ReportesModule { }
