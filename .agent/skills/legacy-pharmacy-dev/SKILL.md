---
name: "Legacy Pharmacy Development Guide"
description: "Guía de desarrollo, arquitectura y buenas prácticas para el proyecto Legacy Pharmacy Dashboard"
---

# Legacy Pharmacy Development Guide

Esta skill documenta la arquitectura, patrones de diseño, y buenas prácticas específicas del proyecto **Legacy Pharmacy Dashboard** - un sistema de gestión farmacéutica con Angular frontend y microservicios Java backend.

---

## 📋 Arquitectura del Proyecto

### Frontend (Angular 19)
- **Framework**: Angular 19 Standalone + Modules híbrido
- **Ubicación**: `c:\Users\LENOVO\OneDrive\otros\Escritorio\project\mi-dashboard`
- **Estilo**: SCSS/CSS componentizado
- **Estado**: Servicios inyectables + RxJS

### Backend (Java Microservicios)
- **Arquitectura**: Microservicios con Spring Boot
- **Gateway**: Puerto 8080 (API Gateway)
- **Servicios**:
  - `inventory-service`: Gestión de productos, stock, kardex
  - `MS-ventas`: Gestión de ventas y transacciones
  - Otros servicios en desarrollo

---

## 🎨 Patrones de Diseño UI

### 1. Sistema de Colores (Slate Palette)
```css
/* Colores principales */
--primary: #3b82f6;      /* Blue 500 */
--primary-dark: #2563eb; /* Blue 600 */
--text-primary: #0f172a; /* Slate 900 */
--text-secondary: #64748b; /* Slate 500 */
--background: #f1f5f9;   /* Slate 100 */
```

### 2. Tipografía Moderna
**Jerarquía de Fuentes:**
- **Títulos Grandes**: 2.25rem, weight 900, letter-spacing -1px
- **Precios Hero**: 4rem, weight 900, letter-spacing -2px
- **Precios Secundarios**: 1.65rem, weight 800
- **Etiquetas**: 0.7rem, weight 600, uppercase, letter-spacing 1px

**Fuentes:**
```css
font-family: 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
```

### 3. Sistema de Badges
```html
<!-- Tipos de badges -->
<span class="badge type-badge">TANGIBLE</span>
<span class="badge stock-badge stock-ok">STOCK_OK</span>
<span class="badge stock-badge stock-low">STOCK_BAJO</span>
<span class="badge stock-count">STOCK: 600</span>
```

**Estilos:**
```css
.badge {
    padding: 4px 10px;
    border-radius: 6px;
    font-size: 0.75rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.5px;
}
```

### 4. Cards Premium
**Características:**
- Border-radius: 16px
- Box-shadow: `0 8px 24px rgba(0, 0, 0, 0.08)`
- Padding interno: 2rem
- Animación de entrada: `slideUp 0.4s ease-out`

---

## 🔧 Modelos de Datos Clave

### ProductoCard (Lista/Dashboard)
```typescript
interface ProductoCard {
    id: number;
    nombreComercial: string;
    codigoInterno: string;
    codigoBarras?: string;
    precioVentaBase: number;
    stockTotal: number;
    esFraccionable: boolean;
    unidadesPorCaja: number;
    // ... otros campos
}
```

### ProductoConsulta (Búsqueda Rápida)
```typescript
interface ProductoConsulta {
    productoId: number;
    nombreProducto: string;
    precioVentaBase: number;
    precioVentaUnidad: number | null;
    precioVentaBlister: number | null;
    unidadesPorCaja: number;
    unidadesPorBlister: number | null;
    cantidadDisponible: number;
    estado: string;
    // ... otros campos
}
```

### ProductoRequest (Formularios)
```typescript
interface ProductoRequest {
    codigoInterno: string;
    nombreComercial: string;
    precioVentaBase: number;
    unidadesPorCaja: number;
    esFraccionable: boolean;
    precioVentaUnidad?: number | null;
    // ... otros campos en camelCase
}
```

---

## ✅ Buenas Prácticas de Código

### 1. Null Safety en Filtros
**❌ INCORRECTO:**
```typescript
products.filter(p => 
    p.nombreComercial.toLowerCase().includes(term)
);
```

**✅ CORRECTO:**
```typescript
products.filter(p => 
    p.nombreComercial?.toLowerCase().includes(term)
);
```

### 2. Manejo de Respuestas del Backend
```typescript
this.service.getData().subscribe({
    next: (data) => {
        if (Array.isArray(data) && data.length === 0) {
            this.showNotFound = true;
        } else {
            this.processData(data);
        }
    },
    error: (err) => {
        console.error('Error:', err);
        this.showError = true;
    }
});
```

### 3. Componentes Standalone vs Modules
- **Nuevos componentes**: Usar standalone cuando sea posible
- **Componentes existentes**: Mantener consistencia con la estructura actual
- **Imports**: Usar CommonModule, FormsModule según necesidad

### 4. Uso de Pipes
```html
<!-- Precios -->
{{ product.price | number:'1.0-0' }}

<!-- Moneda -->
{{ product.price | currency:'COP':'symbol-narrow':'1.0-0' }}

<!-- Fechas -->
{{ product.date | date:'dd/MM/yyyy' }}
```

---

## 🔄 Flujos de Negocio Importantes

### 1. Búsqueda Rápida de Productos
1. **Carga inicial**: `getProductosAlmacen()` → ProductoCard[]
2. **Filtrado local**: Buscar por código/nombre
3. **Match exacto**: Llamar API `consultarPrecio(term)`
4. **Mostrar resultados**: Single card o lista múltiple

### 2. Venta Fraccionada
- **Validar**: `esFraccionable === true`
- **Calcular precio unitario**: Si `precioVentaUnidad` es null, BACKEND calcula
- **Mostrar precios**: Base (Caja), Blíster, Unidad en jerarquía visual

### 3. Entrada de Mercancía
- **Backend calcula**: Precio blíster automáticamente
- **Frontend muestra**: Hints de unidades por caja
- **Validación**: Stock mínimo, fechas de vencimiento

---

## 🎯 Convenciones de Nombrado

### Archivos
- Componentes: `feature-name.component.ts`
- Servicios: `feature.service.ts`
- Modelos: `feature.model.ts`
- CSS/SCSS: Mismo nombre que componente

### Variables TypeScript
```typescript
// camelCase para variables y métodos
selectedProduct: ProductoConsulta | null;
fetchProductDetails(term: string): void

// PascalCase para clases e interfaces
class ProductService
interface ProductoCard
```

### CSS Classes
```css
/* kebab-case */
.price-check-card { }
.product-info-column { }
.secondary-price-block { }
```

---

## 🚨 Errores Comunes a Evitar

### 1. No manejar null en cadenas
```typescript
// ❌ MAL
product.field.toLowerCase()

// ✅ BIEN
product.field?.toLowerCase()
```

### 2. No validar arrays vacíos
```typescript
// ❌ MAL
if (data) { this.products = data; }

// ✅ BIEN
if (data && data.length > 0) { 
    this.products = data; 
} else {
    this.showEmpty = true;
}
```

### 3. Hardcodear valores
```typescript
// ❌ MAL
const blisterUnits = 10;

// ✅ BIEN
const blisterUnits = product.unidadesPorBlister || 10;
```

### 4. Olvidar unsubscribe
```typescript
// ❌ MAL
ngOnInit() {
    this.service.getData().subscribe(...);
}

// ✅ BIEN
subscription!: Subscription;
ngOnInit() {
    this.subscription = this.service.getData().subscribe(...);
}
ngOnDestroy() {
    this.subscription?.unsubscribe();
}
```

---

## 📦 Estructura de Directorios

```
mi-dashboard/
├── src/
│   ├── app/
│   │   ├── core/
│   │   │   ├── models/          # Interfaces compartidas
│   │   │   ├── services/        # Servicios globales
│   │   │   └── guards/          # Auth guards
│   │   ├── shared/
│   │   │   └── components/      # Componentes reutilizables
│   │   └── pages/
│   │       ├── products/
│   │       │   ├── product-list/
│   │       │   ├── product-form/
│   │       │   ├── product-search/
│   │       │   └── product.service.ts
│   │       ├── sales/
│   │       └── inventory/
│   └── styles/                  # Estilos globales
```

---

## 🔍 Debugging Tips

### 1. Errores de API
```typescript
// Agregar logs detallados
console.log('🚀 [Service] Calling:', endpoint, params);
console.log('📦 [Service] Response:', data);
console.error('❌ [Service] Error:', err);
```

### 2. Problemas de Renderizado
- Verificar `*ngIf` conditions
- Revisar async pipes
- Inspeccionar data en DevTools

### 3. Problemas de Estilos
- Usar Inspector del navegador
- Verificar especificidad CSS
- Revisar ViewEncapsulation

---

## 📚 Recursos de Referencia

- **Angular Docs**: https://angular.dev/
- **RxJS**: https://rxjs.dev/
- **TypeScript**: https://www.typescriptlang.org/
- **Spring Boot**: https://spring.io/projects/spring-boot

---

## 🎓 Próximas Mejoras Sugeridas

1. **Tests Unitarios**: Agregar Jasmine/Karma tests
2. **E2E Tests**: Implementar Cypress/Playwright
3. **Estado Global**: Considerar NgRx si crece la complejidad
4. **PWA**: Convertir a Progressive Web App
5. **Optimizaciones**: Lazy loading de módulos

---

**Última actualización**: 2026-02-05
**Mantenedor**: Equipo Legacy Pharmacy
