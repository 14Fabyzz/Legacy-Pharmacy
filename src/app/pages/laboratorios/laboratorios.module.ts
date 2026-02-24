import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TabsNavComponent } from '../../shared/components/tabs-nav/tabs-nav.component';

import { LaboratoriosRoutingModule } from './laboratorios-routing.module';
import { LaboratorioListComponent } from './laboratorio-list/laboratorio-list.component';

@NgModule({
    declarations: [
        LaboratorioListComponent
    ],
    imports: [
        CommonModule,
        TabsNavComponent,
        LaboratoriosRoutingModule
    ]
})
export class LaboratoriosModule { }
