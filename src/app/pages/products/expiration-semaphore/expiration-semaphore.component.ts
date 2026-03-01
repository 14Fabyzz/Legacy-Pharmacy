import { Component, OnInit, OnDestroy, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { ProductService, LoteAlerta } from '../product.service';

@Component({
  selector: 'app-expiration-semaphore',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './expiration-semaphore.component.html',
  styleUrls: ['./expiration-semaphore.component.css']
})
export class ExpirationSemaphoreComponent implements OnInit, OnDestroy {
  @Output() close = new EventEmitter<void>();

  /** Semáforo Rojo: <= 90 días (diasRestantes puede ser negativo si vencido) */
  rojoLotes: LoteAlerta[] = [];
  /** Semáforo Amarillo: 91–180 días */
  amarilloLotes: LoteAlerta[] = [];
  /** Semáforo Verde: solo KPI, el array llega vacío del backend */
  totalVerde: number = 0;

  loading: boolean = true;
  private sub!: Subscription;

  constructor(private productService: ProductService) { }

  ngOnInit(): void {
    this.sub = this.productService.getDashboardAlertas().subscribe({
      next: (data) => {
        this.rojoLotes = data.rojo || [];
        this.amarilloLotes = data.amarillo || [];
        this.totalVerde = data.totalVerde || 0;
        this.loading = false;
      },
      error: (err) => {
        console.error('❌ [Semáforo] Error cargando alertas:', err);
        this.loading = false;
      }
    });
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
  }

  /** Retorna true si el lote ya está vencido */
  isVencido(lote: LoteAlerta): boolean {
    return lote.diasRestantes < 0;
  }

  darDeBaja(loteId: number): void {
    if (confirm('¿Estás seguro de dar de baja este lote vencido?')) {
      this.productService.darDeBajaLote(loteId).subscribe(() => {
        alert('Lote dado de baja correctamente.');
        // Recargar datos del modal
        this.productService.getDashboardAlertas().subscribe(data => {
          this.rojoLotes = data.rojo || [];
          this.amarilloLotes = data.amarillo || [];
          this.totalVerde = data.totalVerde || 0;
        });
      });
    }
  }

  onClose(): void {
    this.close.emit();
  }
}
