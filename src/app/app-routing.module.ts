import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

// Importa tus componentes principales
import { LayoutComponent } from './layout/layout.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { LoginComponent } from './pages/login/login.component'; // Asegúrate de importar LoginComponent
import { PurchaseEntryComponent } from './pages/purchases/purchase-entry/purchase-entry.component';

const routes: Routes = [
  // 1. Ruta para el login
  {
    path: 'login',
    component: LoginComponent
  },

  // 2. Ruta para la aplicación principal (el layout y sus hijos)
  {
    path: 'app', // La app principal vive en /app
    component: LayoutComponent,
    children: [
      { path: 'dashboard', component: DashboardComponent },
      {
        path: 'productos', // Aquí se carga el módulo de productos
        loadChildren: () => import('./pages/products/products.module').then(m => m.ProductsModule)
      },

      {
        path: 'purchases/purchase-entry',
        component: PurchaseEntryComponent
      },
      {
        path: 'ventas',
        loadChildren: () => import('./pages/sales/sales.module').then(m => m.SalesModule)
      },
      {
        path: 'caja',
        loadChildren: () => import('./pages/caja/caja.module').then(m => m.CajaModule)
      },
      {
        path: 'users',
        loadChildren: () => import('./pages/users/users.module').then(m => m.UsersModule)
      },
      {
        path: 'reportes',
        loadChildren: () => import('./pages/reportes/reportes.module').then(m => m.ReportesModule)
      },
      {
        path: 'kardex',
        loadChildren: () => import('./pages/products/products.module').then(m => m.ProductsModule)
      },
      {
        path: 'categorias',
        loadChildren: () => import('./pages/categorias/categorias.module').then(m => m.CategoriasModule)
      },
      {
        path: 'laboratorios',
        loadChildren: () => import('./pages/laboratorios/laboratorios.module').then(m => m.LaboratoriosModule)
      },
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' }
    ]
  },

  // 3. Ruta de entrada: redirige la raíz ('') a '/login'
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full'
  },


  // 4. Ruta comodín (wildcard): cualquier otra URL redirige a '/login'
  {
    path: '**',
    redirectTo: 'dashboard'
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }