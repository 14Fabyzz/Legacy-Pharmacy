import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { SalesRoutingModule } from './sales-routing.module';
import { SalesComponent } from './sales.component';
import { NewSaleComponent } from './new-sale/new-sale.component';

@NgModule({
  declarations: [
    SalesComponent
  ],
  imports: [
    CommonModule,
    SalesRoutingModule,
    FormsModule,
    NewSaleComponent
  ]
})
export class SalesModule { }
