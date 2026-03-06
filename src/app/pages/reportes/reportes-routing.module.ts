import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ReportesComponent } from './reportes.component';
import { VentasConsolidadoComponent } from './ventas-consolidado/ventas-consolidado.component';
import { TopRotacionComponent } from './top-rotacion/top-rotacion.component';
import { ConsolidadoPagosComponent } from './consolidado-pagos/consolidado-pagos.component';
import { ResumenInteligenteComponent } from './resumen-inteligente/resumen-inteligente.component';

const routes: Routes = [
    {
        path: '',
        component: ReportesComponent
    },
    { path: 'ventas-consolidado', component: VentasConsolidadoComponent },
    { path: 'top-rotacion', component: TopRotacionComponent },
    { path: 'consolidado-pagos', component: ConsolidadoPagosComponent },
    { path: 'resumen-inteligente', component: ResumenInteligenteComponent }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class ReportesRoutingModule { }
