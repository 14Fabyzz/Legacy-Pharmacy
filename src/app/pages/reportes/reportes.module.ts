import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BaseChartDirective } from 'ng2-charts';

import { ReportesRoutingModule } from './reportes-routing.module';
import { ReportesComponent } from './reportes.component';
import { VentasConsolidadoComponent } from './ventas-consolidado/ventas-consolidado.component';

@NgModule({
    declarations: [
        ReportesComponent,
        VentasConsolidadoComponent
    ],
    imports: [
        CommonModule,
        FormsModule,
        ReportesRoutingModule,
        BaseChartDirective
    ]
})
export class ReportesModule { }
