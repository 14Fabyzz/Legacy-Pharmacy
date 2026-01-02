import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProductService } from '../product.service';
import { Producto } from '../../../core/models/inventory.model';

@Component({
  selector: 'app-expiration-semaphore',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './expiration-semaphore.component.html',
  styleUrls: ['./expiration-semaphore.component.css']
})
export class ExpirationSemaphoreComponent implements OnInit {
  @Output() close = new EventEmitter<void>();

  vencidos: Producto[] = [];
  porVencer: Producto[] = [];
  seguros: Producto[] = [];

  constructor(private productService: ProductService) { }

  ngOnInit(): void {
    this.productService.getProducts().subscribe(products => {
      const classified = this.productService.classifyByExpiration(products);
      this.vencidos = classified.vencidos;
      this.porVencer = classified.porVencer;
      this.seguros = classified.seguros;
    });
  }

  onClose(): void {
    this.close.emit();
  }
}
