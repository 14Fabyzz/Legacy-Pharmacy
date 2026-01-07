import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ExpirationDashboardComponent } from './expiration-dashboard/expiration-dashboard.component';

import { ProductsRoutingModule } from './products-routing.module';



@NgModule({
  declarations: [
    ExpirationDashboardComponent
  ],
  imports: [
    CommonModule,
    ProductsRoutingModule
  ]
})
export class ProductsModule { }
