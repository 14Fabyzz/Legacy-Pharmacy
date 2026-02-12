import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { debounceTime, distinctUntilChanged, switchMap, tap } from 'rxjs/operators';
import { of } from 'rxjs'; // For empty search
import { ProductoInventarioDTO } from '../../../core/services/inventory.service';

import { forkJoin } from 'rxjs';
import { finalize } from 'rxjs/operators';
import { ProductService } from '../product.service';
import { InventoryService } from '../../../core/services/inventory.service';
import { MovimientoKardex, Producto } from '../../../core/models/product.model';

@Component({
    selector: 'app-kardex',
    standalone: true,
    imports: [CommonModule, RouterModule, ReactiveFormsModule],
    templateUrl: './kardex.component.html',
    styleUrls: ['./kardex.component.css']
})
export class KardexComponent implements OnInit {
    productId: number | null = null;
    product: Producto | null = null;
    movimientos: MovimientoKardex[] = [];
    selectedMovement: MovimientoKardex | null = null;
    cargando = false;

    // Search
    searchControl = new FormControl('');
    searchResults: ProductoInventarioDTO[] = [];
    showResults = false;
    isGlobalMode = false;

    constructor(
        private route: ActivatedRoute,
        private productService: ProductService,
        private inventoryService: InventoryService,
        @Inject(PLATFORM_ID) private platformId: Object
    ) { }

    ngOnInit(): void {
        this.setupSearch();

        this.route.params.subscribe(params => {
            const id = params['id'];

            if (id) {
                // ESCENARIO A: Vista Producto Específico
                this.isGlobalMode = false;
                this.productId = +id;

                if (isPlatformBrowser(this.platformId)) {
                    this.loadKardexData(this.productId);
                }
            } else {
                // ESCENARIO B: Vista Global (Auditoría)
                this.isGlobalMode = true;
                this.productId = null;
                this.product = null;
                this.movimientos = [];

                // Limpiamos buscador
                this.searchControl.setValue('', { emitEvent: false });

                if (isPlatformBrowser(this.platformId)) {
                    this.loadGlobalHistory();
                }
            }
        });
    }

    setupSearch() {
        this.searchControl.valueChanges.pipe(
            debounceTime(300),
            distinctUntilChanged(),
            switchMap(term => {
                if (!term || term.length < 2) {
                    return of([]);
                }
                return this.inventoryService.buscarProductos(term);
            })
        ).subscribe(results => {
            this.searchResults = results;
            this.showResults = true;
        });
    }

    selectProduct(producto: ProductoInventarioDTO) {
        this.productId = producto.productoId;
        this.searchControl.setValue('', { emitEvent: false }); // Clear search but don't emit
        this.showResults = false;
        // Navegamos o cargamos directamente. Mejor cargar directo para SPA feel.
        // Pero idealmente actualizar URL. Por ahora cargamos data.
        this.isGlobalMode = false;
        this.loadKardexData(this.productId);
    }

    loadGlobalHistory() {
        this.cargando = true;
        this.inventoryService.obtenerUltimosMovimientos()
            .pipe(finalize(() => this.cargando = false))
            .subscribe({
                next: (data) => {
                    this.movimientos = data;
                    // Ordenamos por fecha descendente
                    this.movimientos.sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime());
                    this.currentPage = 1; // Reset pagination
                },
                error: (err) => console.error('Error loading global history', err)
            });
    }

    loadKardexData(id: number) {
        this.cargando = true;

        forkJoin({
            product: this.productService.getProductById(id),
            kardex: this.inventoryService.obtenerKardex(id)
        }).pipe(
            finalize(() => this.cargando = false)
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
                this.currentPage = 1; // Reset pagination
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

    // Pagination
    currentPage = 1;
    itemsPerPage = 10;

    get totalPages(): number {
        return Math.ceil(this.movimientos.length / this.itemsPerPage);
    }

    get paginatedMovimientos(): MovimientoKardex[] {
        const start = (this.currentPage - 1) * this.itemsPerPage;
        const end = start + this.itemsPerPage;
        return this.movimientos.slice(start, end);
    }

    nextPage() {
        if (this.currentPage < this.totalPages) {
            this.currentPage++;
        }
    }

    prevPage() {
        if (this.currentPage > 1) {
            this.currentPage--;
        }
    }

    goToPage(page: number) {
        if (page >= 1 && page <= this.totalPages) {
            this.currentPage = page;
        }
    }

    abs(val: number): number {
        return Math.abs(val);
    }

}
