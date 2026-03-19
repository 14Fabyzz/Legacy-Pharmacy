import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TabsNavComponent } from '../../shared/components/tabs-nav/tabs-nav.component';

import { CategoriasRoutingModule } from './categorias-routing.module';
import { CategoriaListComponent } from './categoria-list/categoria-list.component';

@NgModule({
    declarations: [
        CategoriaListComponent
    ],
    imports: [
        CommonModule,
        TabsNavComponent,
        CategoriasRoutingModule
    ]
})
export class CategoriasModule { }
