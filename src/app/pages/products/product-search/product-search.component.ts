import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { ProductService } from '../product.service';
import { Producto, ProductoConsulta } from '../../../core/models/product.model';

@Component({
    selector: 'app-product-search',
    templateUrl: './product-search.component.html',
    styleUrls: ['./product-search.component.css'],
    standalone: false
})
export class ProductSearchComponent implements OnInit {

    @ViewChild('searchInput') searchInput!: ElementRef;

    searchTerm: string = '';
    products: any[] = [];
    resultados: ProductoConsulta[] = [];
    filteredSuggestions: any[] = [];
    selectedProduct: ProductoConsulta | null = null;
    notFound: boolean = false;

    constructor(private productService: ProductService) { }

    ngOnInit(): void {
        // Cargar productos en memoria para búsqueda rápida
        this.productService.getProductosAlmacen().subscribe(data => {
            this.products = data;
        });

        setTimeout(() => this.focusInput(), 100);
    }

    focusInput(): void {
        if (this.searchInput) {
            this.searchInput.nativeElement.focus();
        }
    }

    onSearch(event: any): void {
        const term = event.target.value.toLowerCase().trim();
        this.notFound = false;
        // No limpiar selectedProduct aquí para evitar parpadeos si está escribiendo
        // pero buscamos en local para sugerencias

        if (!term) {
            this.filteredSuggestions = [];
            return;
        }

        // 1. Intentar búsqueda exacta
        const exactMatch = this.products.find(p =>
            p.codigoBarras === term || p.codigoInterno?.toLowerCase() === term
        );

        if (exactMatch) {
            // Call API for details
            this.fetchProductDetails(exactMatch.codigoBarras || exactMatch.nombreComercial);
            this.searchTerm = '';
            this.filteredSuggestions = [];
            return;
        }

        // 2. Sugerencias
        this.filteredSuggestions = this.products.filter(p =>
            p.nombreComercial.toLowerCase().includes(term) ||
            p.codigoInterno?.toLowerCase().includes(term)
        ).slice(0, 5);
    }

    onEnter(): void {
        if (this.filteredSuggestions.length > 0) {
            this.selectProduct(this.filteredSuggestions[0]);
        } else {
            // Try to fetch by term directly from API as a fallback? 
            // Or just show not found if local search failed.
            // For now, consistent with previous behavior:
            this.notFound = true;
            this.selectedProduct = null;
        }
        this.searchTerm = '';
        this.filteredSuggestions = [];
    }

    selectProduct(product: any): void {
        this.fetchProductDetails(product.codigoBarras || product.nombreComercial);
        this.filteredSuggestions = [];
        this.searchTerm = '';
    }

    fetchProductDetails(term: string) {
        this.productService.consultarPrecio(term).subscribe({
            next: (data: ProductoConsulta[]) => {
                // Lógica de respuesta Array
                if (data.length === 0) {
                    this.notFound = true;
                    this.selectedProduct = null;
                    this.resultados = [];
                } else if (data.length === 1) {
                    // Bingo: Escaneo exacto o solo 1 coincidencia
                    this.selectedProduct = data[0];
                    this.resultados = [];
                    this.notFound = false;
                } else {
                    // Múltiples resultados: Mostrar lista
                    this.resultados = data;
                    this.selectedProduct = null;
                    this.notFound = false;
                }
            },
            error: (err) => {
                console.error('Error fetching price details', err);
                this.selectedProduct = null;
                this.resultados = [];
                this.notFound = true;
            }
        });
    }

    clearSearch(): void {
        this.selectedProduct = null;
        this.searchTerm = '';
        this.notFound = false;
        this.focusInput();
    }
}
