import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CajaComponent } from './caja.component';
import { AbrirCajaComponent } from './abrir-caja/abrir-caja.component';
import { CerrarCajaComponent } from './cerrar-caja/cerrar-caja.component';
import { EstadoCajaComponent } from './estado-caja/estado-caja.component';

const routes: Routes = [
    {
        path: '',
        component: CajaComponent,
        children: [
            { path: 'abrir', component: AbrirCajaComponent },
            { path: 'cerrar', component: CerrarCajaComponent },
            { path: 'estado', component: EstadoCajaComponent },
            { path: '', redirectTo: 'estado', pathMatch: 'full' }
        ]
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class CajaRoutingModule { }
