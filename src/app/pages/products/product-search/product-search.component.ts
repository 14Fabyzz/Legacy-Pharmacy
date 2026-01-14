import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { ProductService } from '../product.service';
import { Producto } from '../../../core/models/product.model';

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
    filteredSuggestions: any[] = [];
    selectedProduct: any | null = null;
    notFound: boolean = false;

    constructor(private productService: ProductService) { }

    ngOnInit(): void {
        // Cargar productos en memoria para búsqueda rápida (en app real sería búsqueda server-side)
        // Usamos getProductosAlmacen para tener el Stock Real calculado
        this.productService.getProductosAlmacen().subscribe(data => {
            this.products = data;
            console.log('Productos cargados (Cards):', this.products.length);
        });

        // Auto-focus al iniciar
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
        this.selectedProduct = null;

        if (!term) {
            this.filteredSuggestions = [];
            return;
        }

        // 1. Intentar búsqueda exacta por Código de Barras o Interno (Simulación escáner)
        const exactMatch = this.products.find(p =>
            p.codigoBarras === term || p.codigoInterno?.toLowerCase() === term
        );

        if (exactMatch) {
            this.selectProduct(exactMatch);
            this.searchTerm = ''; // Limpiar para siguiente escaneo
            this.filteredSuggestions = [];
            return;
        }

        // 2. Si no es exacto, buscar coincidencias por nombre (Sugerencias)
        this.filteredSuggestions = this.products.filter(p =>
            p.nombreComercial.toLowerCase().includes(term) ||
            p.codigoInterno?.toLowerCase().includes(term)
        ).slice(0, 5); // Max 5 sugerencias

        if (this.filteredSuggestions.length === 0) {
            // Solo mostrar "No encontrado" si fue un enter explícito (evento keyup.enter en HTML)
            // Opcional: manejar flag notFound aquí si se quiere instantáneo
        }
    }

    // Se llama al presionar Enter en el input
    onEnter(): void {
        if (this.filteredSuggestions.length > 0) {
            // Seleccionar el primero si hay sugerencias
            this.selectProduct(this.filteredSuggestions[0]);
        } else {
            this.notFound = true;
            this.selectedProduct = null;
        }
        this.searchTerm = '';
        this.filteredSuggestions = [];
    }

    selectProduct(product: any): void {
        this.selectedProduct = product;
        this.notFound = false;
        this.filteredSuggestions = [];
        this.searchTerm = '';
    }

    clearSearch(): void {
        this.selectedProduct = null;
        this.searchTerm = '';
        this.notFound = false;
        this.focusInput();
    }
}
