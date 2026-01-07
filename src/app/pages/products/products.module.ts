import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ExpirationDashboardComponent } from './expiration-dashboard/expiration-dashboard.component';
import { ProductSearchComponent } from './product-search/product-search.component';

import { ProductsRoutingModule } from './products-routing.module';



@NgModule({
  declarations: [
    ExpirationDashboardComponent,
    ProductSearchComponent
  ],
  imports: [
    CommonModule,
    ProductsRoutingModule,
    FormsModule
  ]
})
export class ProductsModule { }
