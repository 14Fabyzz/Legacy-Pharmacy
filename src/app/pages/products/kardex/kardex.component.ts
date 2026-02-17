import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { FormControl, ReactiveFormsModule, FormsModule } from '@angular/forms';
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
    imports: [CommonModule, RouterModule, ReactiveFormsModule, FormsModule],
    templateUrl: './kardex.component.html',
    styleUrls: ['./kardex.component.css']
})
export class KardexComponent implements OnInit {
    productId: number | null = null;
    product: Producto | null = null;
    movimientos: MovimientoKardex[] = [];
    selectedMovement: MovimientoKardex | null = null;
    cargando = false;

    // Search & Filter
    searchControl = new FormControl('');
    searchResults: ProductoInventarioDTO[] = [];
    showResults = false;
    isGlobalMode = false;

    // Local Filtering
    allMovements: MovimientoKardex[] = [];
    startDate: string = '';
    endDate: string = '';

    constructor(
        private route: ActivatedRoute,
        private productService: ProductService,
        private inventoryService: InventoryService,
        @Inject(PLATFORM_ID) private platformId: Object
    ) { }

    ngOnInit(): void {
        // Setup local search filter on the existing control
        this.searchControl.valueChanges.subscribe(() => {
            this.applyFilters();
        });

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
                this.allMovements = [];

                // Limpiamos buscador
                this.searchControl.setValue('', { emitEvent: false });

                if (isPlatformBrowser(this.platformId)) {
                    this.loadGlobalHistory();
                }
            }
        });
    }

    // REMOVED: setupSearch() - We now use local filtering, or we keep it?
    // User wanted "simple". Local filtering of loaded list is simplest.
    // If we want to search *other* products to switch to them, we need the dropdown.
    // But the user complained "search doesn't work".
    // Let's Keep the dropdown ONLY for Global Mode maybe? Or just use the filter?
    // User said: "hagamos que podamos filtarar por fecha" and "buscando... no sirve".
    // I will implement PURE FILTERING on the current list as requested.
    // If they want to switch product, they can go back or we can add a specific "Find Product" button later.
    // For now, the input will filter the CURRENT list.

    applyFilters() {
        let filtered = [...this.allMovements];

        // 1. Text Filter
        const term = (this.searchControl.value || '').trim().toLowerCase();
        if (term) {
            filtered = filtered.filter(m =>
                (m.nombre_producto && m.nombre_producto.toLowerCase().includes(term)) ||
                (m.documento_ref && m.documento_ref.toLowerCase().includes(term)) ||
                (m.usuario && m.usuario.toLowerCase().includes(term)) ||
                (m.lote && m.lote.toLowerCase().includes(term))
            );
        }

        // 2. Date Range Filter
        if (this.startDate) {
            const start = new Date(this.startDate);
            start.setHours(0, 0, 0, 0);
            filtered = filtered.filter(m => new Date(m.fecha) >= start);
        }

        if (this.endDate) {
            const end = new Date(this.endDate);
            end.setHours(23, 59, 59, 999);
            filtered = filtered.filter(m => new Date(m.fecha) <= end);
        }

        this.movimientos = filtered;
        this.currentPage = 1; // Reset pagination
    }

    selectProduct(producto: ProductoInventarioDTO) {
        // ... kept for compatibility if needed, but UI might hide it
        this.productId = producto.productoId;
    }

    loadGlobalHistory() {
        this.cargando = true;
        this.inventoryService.obtenerUltimosMovimientos()
            .pipe(finalize(() => this.cargando = false))
            .subscribe({
                next: (data) => {
                    this.allMovements = data; // Save backup
                    // Sort descending
                    this.allMovements.sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime());
                    this.applyFilters(); // Populate movimientos
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
                this.allMovements = response.kardex; // Save backup

                // Sort descending
                this.allMovements.sort((a, b) => {
                    const dateA = new Date(a.fecha).getTime();
                    const dateB = new Date(b.fecha).getTime();
                    return dateB - dateA;
                });

                this.applyFilters(); // Populate movimientos
            },
            error: (err) => {
                console.error('Error loading Kardex data', err);
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
