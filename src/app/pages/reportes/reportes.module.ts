import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BaseChartDirective } from 'ng2-charts';

import { ReportesRoutingModule } from './reportes-routing.module';
import { ReportesComponent } from './reportes.component';
import { VentasConsolidadoComponent } from './ventas-consolidado/ventas-consolidado.component';
import { TopRotacionComponent } from './top-rotacion/top-rotacion.component';

@NgModule({
    declarations: [
        ReportesComponent,
        VentasConsolidadoComponent,
        TopRotacionComponent
    ],
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        ReportesRoutingModule,
        BaseChartDirective
    ]
})
export class ReportesModule { }
