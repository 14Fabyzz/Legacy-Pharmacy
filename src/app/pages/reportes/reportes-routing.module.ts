import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ReportesComponent } from './reportes.component';
import { ResumenInteligenteComponent } from './resumen-inteligente/resumen-inteligente.component';
import { PulsoInventarioComponent } from './pulso-inventario/pulso-inventario.component';
import { MotorVentasComponent } from './motor-ventas/motor-ventas.component';

const routes: Routes = [
    {
        path: '',
        component: ReportesComponent
    },
    { path: 'resumen-inteligente', component: ResumenInteligenteComponent },
    { path: 'pulso-inventario', component: PulsoInventarioComponent },
    { path: 'motor-ventas', component: MotorVentasComponent }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class ReportesRoutingModule { }
