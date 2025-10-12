import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { LoginComponent } from './pages/login/login.component';
import { LayoutComponent } from './layout/layout.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { HeaderComponent } from './shared/header/header.component';
import { ProductFormComponent } from './pages/products/product-form/product-form.component';
import { ProductListComponent } from './pages/products/product-list/product-list.component'; 

// SidebarComponent es standalone, por lo que no se importa ni declara aquí.
// HeaderComponent es standalone, por lo que SE IMPORTA, NO SE DECLARA.

@NgModule({
  // HeaderComponent se quita de aquí
  declarations: [
    AppComponent,
    LoginComponent,
    
    
  ],
  
  imports: [
    BrowserModule,
    AppRoutingModule,
    CommonModule,
    RouterModule,
    HeaderComponent,
    LayoutComponent, 
    DashboardComponent,
    ProductFormComponent,
    

  ],
  providers: [],  
  bootstrap: [AppComponent]
})
export class AppModule { }