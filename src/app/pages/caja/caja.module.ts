import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CajaRoutingModule } from './caja-routing.module';
import { CajaComponent } from './caja.component';
import { AbrirCajaComponent } from './abrir-caja/abrir-caja.component';
import { CerrarCajaComponent } from './cerrar-caja/cerrar-caja.component';
import { EstadoCajaComponent } from './estado-caja/estado-caja.component';

@NgModule({
    declarations: [
        CajaComponent,
        AbrirCajaComponent,
        CerrarCajaComponent,
        EstadoCajaComponent
    ],
    imports: [
        CommonModule,
        CajaRoutingModule,
        FormsModule
    ]
})
export class CajaModule { }
