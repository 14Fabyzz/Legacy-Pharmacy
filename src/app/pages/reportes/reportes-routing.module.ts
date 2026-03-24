import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ReportesComponent } from './reportes.component';
import { ResumenInteligenteComponent } from './resumen-inteligente/resumen-inteligente.component';
import { PulsoInventarioComponent } from './pulso-inventario/pulso-inventario.component';
import { MotorVentasComponent } from './motor-ventas/motor-ventas.component';

import { DetalleReporteComponent } from './detalle-reporte/detalle-reporte.component';

const routes: Routes = [
    {
        path: '',
        component: ReportesComponent
    },
    { path: 'resumen-inteligente', component: ResumenInteligenteComponent },
    { path: 'pulso-inventario', component: PulsoInventarioComponent },
    { path: 'motor-ventas', component: MotorVentasComponent },
    { path: 'analitico/:tipo', component: DetalleReporteComponent }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class ReportesRoutingModule { }
