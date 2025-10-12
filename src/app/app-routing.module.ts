import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

// Ya NO importamos ProductFormComponent ni ProductListComponent aquí
import { LayoutComponent } from './layout/layout.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { LoginComponent } from './pages/login/login.component';



const routes: Routes = [
  { path: 'login', component: LoginComponent },
  {
    path: '',
    component: LayoutComponent,
    children: [
      { path: 'dashboard', component: DashboardComponent },
      
      
      {
        path: 'productos', // Cuando la URL empiece con 'productos'...
        loadChildren: () => import('./pages/products/products.module').then(m => m.ProductsModule)
      },

      // ... tus otras rutas
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' }
    ]
  },
  { path: '**', redirectTo: 'dashboard' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }