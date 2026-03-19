import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LaboratorioListComponent } from './laboratorio-list/laboratorio-list.component';

const routes: Routes = [
    { path: '', component: LaboratorioListComponent }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class LaboratoriosRoutingModule { }
