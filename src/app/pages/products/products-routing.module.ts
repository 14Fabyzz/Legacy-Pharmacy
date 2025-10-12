import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';


import { ProductListComponent } from './product-list/product-list.component';
import { ProductFormComponent } from './product-form/product-form.component';

const routes: Routes = [{
    path: 'nuevo', // Se accederá con /productos/nuevo
    component: ProductFormComponent
  },
  {
    path: 'almacen', // Se accederá con /productos/almacen
    component: ProductListComponent
  },
  {
    path: '', // Si alguien navega solo a /productos
    redirectTo: 'almacen', // Redirige a la lista de productos
    pathMatch: 'full'
  }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ProductsRoutingModule { }
