import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BaseChartDirective } from 'ng2-charts';

import { ReportesRoutingModule } from './reportes-routing.module';
import { ReportesComponent } from './reportes.component';
import { VentasConsolidadoComponent } from './ventas-consolidado/ventas-consolidado.component';
import { TopRotacionComponent } from './top-rotacion/top-rotacion.component';
import { ConsolidadoPagosComponent } from './consolidado-pagos/consolidado-pagos.component';
import { ResumenInteligenteComponent } from './resumen-inteligente/resumen-inteligente.component';

@NgModule({
    declarations: [
        ReportesComponent,
        VentasConsolidadoComponent,
        TopRotacionComponent,
        ConsolidadoPagosComponent,
        ResumenInteligenteComponent
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
