import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ReportesComponent } from './reportes.component';
import { VentasConsolidadoComponent } from './ventas-consolidado/ventas-consolidado.component';

const routes: Routes = [
    {
        path: '',
        component: ReportesComponent,
        children: [
            { path: 'ventas-consolidado', component: VentasConsolidadoComponent },
            { path: '', redirectTo: 'ventas-consolidado', pathMatch: 'full' }
        ]
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class ReportesRoutingModule { }
