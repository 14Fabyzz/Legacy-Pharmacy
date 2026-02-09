import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';

import { forkJoin } from 'rxjs';
import { finalize } from 'rxjs/operators';
import { ProductService } from '../product.service';
import { MovimientoKardex, Producto } from '../../../core/models/product.model';

@Component({
    selector: 'app-kardex',
    standalone: true,
    imports: [CommonModule, RouterModule],
    templateUrl: './kardex.component.html',
    styleUrls: ['./kardex.component.css']
})
export class KardexComponent implements OnInit {
    productId: number | null = null;
    product: Producto | null = null;
    movimientos: MovimientoKardex[] = [];
    selectedMovement: MovimientoKardex | null = null;
    isLoading = false;

    constructor(
        private route: ActivatedRoute,
        private productService: ProductService
    ) { }

    ngOnInit(): void {
        this.route.params.subscribe(params => {
            // Si viene parámetro, lo usamos. Si no (desde sidebar), usamos ID 15 por defecto para demo.
            this.productId = params['id'] ? +params['id'] : 15;
            this.loadKardexData(this.productId);
        });
    }

    loadKardexData(id: number) {
        this.isLoading = true;

        forkJoin({
            product: this.productService.getProductById(id),
            kardex: this.productService.getProductKardex(id)
        }).pipe(
            finalize(() => this.isLoading = false)
        ).subscribe({
            next: (response) => {
                this.product = response.product;
                this.movimientos = response.kardex;

                // Sort descending by date (newest first)
                this.movimientos.sort((a, b) => {
                    const dateA = new Date(a.fecha).getTime();
                    const dateB = new Date(b.fecha).getTime();
                    return dateB - dateA;
                });
            },
            error: (err) => {
                console.error('Error loading Kardex data', err);
                // Aquí podrías usar Swal si lo deseas, pero un console basta por ahora como pediste
            }
        });
    }

    openDetail(movement: MovimientoKardex) {
        this.selectedMovement = movement;
    }

    closeDetail() {
        this.selectedMovement = null;
    }

    abs(val: number): number {
        return Math.abs(val);
    }

}
