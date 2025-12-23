import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

// Solo importamos los componentes de PRODUCTOS
import { ProductListComponent } from './product-list/product-list.component';
import { ProductFormComponent } from './product-form/product-form.component';
import { PurchaseEntryComponent } from '../purchases/purchase-entry/purchase-entry.component';


const routes: Routes = [
  {
    path: 'nuevo', // Ruta: /productos/nuevo
    component: ProductFormComponent
  },
  {
    path: 'almacen', // Ruta: /productos/almacen
    component: ProductListComponent
  },
  {
    path: 'editar/:id', // Ruta: /productos/editar/123
    component: ProductFormComponent
  },
  {
    path: 'entrada-mercancia',
    component: PurchaseEntryComponent
  },
  {
    path: '', // Si solo escriben /productos
    redirectTo: 'almacen', // Los manda a la lista
    pathMatch: 'full'
  }
  // NO debe haber rutas de 'login', '' o '**' aquí
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ProductsRoutingModule { }