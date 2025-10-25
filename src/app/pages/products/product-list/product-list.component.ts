import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { SearchPipe } from '../../../shared/pipes/search.pipe';
import { ProductService } from '../product.service';
import { Observable } from 'rxjs';


// Definimos la estructura de un producto
interface Product {
  idCodigo: string;       // Corresponde a id_codigo VARCHAR(50)
  nombre: string;         // Corresponde a nombre VARCHAR(255)
  codigoBarras: string;   // Corresponde a codigo_barras VARCHAR(10...)
  precioVenta: number;    // Corresponde a precio_venta DECIMAL(10,2)
  ivaPorcentaje: number;  // Corresponde a iva_porcentaje DECIMAL(4,2)
  laboratorioId: number;
}

@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [
    CommonModule, // Para *ngFor, *ngIf y el pipe currency
    RouterModule,  // Para routerLink en las pestañas
    FormsModule,
    SearchPipe    // Pipe de búsqueda personalizado

  ],
  templateUrl: './product-list.component.html',
  styleUrls: ['./product-list.component.css']
})
export class ProductListComponent implements OnInit {
 
 public searchTerm: string = '';
  
  // 3. Reemplaza el array por un Observable
  public products$!: Observable<any[]>;

  constructor(private productService: ProductService) {} // <-- 4. Inyecta el servicio

  ngOnInit(): void {
    // 5. Llama al servicio para obtener los datos
    this.products$ = this.productService.getProducts();
  }

}