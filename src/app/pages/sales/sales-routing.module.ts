import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SalesComponent } from './sales.component';
import { NewSaleComponent } from './new-sale/new-sale.component';
import { HistorialVentasComponent } from './historial-ventas/historial-ventas.component';

const routes: Routes = [
  {
    path: '',
    component: SalesComponent,
    children: [
      { path: 'nueva', component: NewSaleComponent },
      { path: 'historial', component: HistorialVentasComponent },
      { path: '', redirectTo: 'nueva', pathMatch: 'full' }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SalesRoutingModule { }
