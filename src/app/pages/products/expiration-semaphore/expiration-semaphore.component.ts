import { Component, OnInit, OnDestroy, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import Swal from 'sweetalert2';
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
    Swal.fire({
      title: 'Dar de Baja Lote',
      text: '¿Está seguro de retirar este lote del stock? Seleccione el motivo:',
      icon: 'warning',
      input: 'select',
      inputOptions: {
        'VENCIMIENTO': 'Vencimiento',
        'DAÑO_FISICO': 'Daño Físico',
        'ROBO': 'Robo',
        'OTRO': 'Otro'
      },
      inputPlaceholder: 'Seleccione un motivo',
      showCancelButton: true,
      confirmButtonText: 'Confirmar Baja',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#dc2626',
      inputValidator: (value) => {
        if (!value) {
          return 'Debes seleccionar un motivo';
        }
        return null;
      }
    }).then((result) => {
      if (result.isConfirmed) {
        const motivo = result.value;

        Swal.fire({
          title: 'Procesando...',
          didOpen: () => Swal.showLoading(),
          allowOutsideClick: false
        });

        this.productService.darDeBajaLote(loteId, motivo).subscribe({
          next: (res) => {
            Swal.fire({
              title: 'Lote de Baja',
              html: `El lote ha sido retirado correctamente.<br><b>Motivo:</b> ${res.motivo}<br><b>Stock ajustado:</b> ${res.cantidadAjustada} unidades`,
              icon: 'success'
            });

            // Recargar datos para ver cambios en el semáforo
            this.productService.getDashboardAlertas().subscribe(data => {
              this.rojoLotes = data.rojo || [];
              this.amarilloLotes = data.amarillo || [];
              this.totalVerde = data.totalVerde || 0;
            });
          },
          error: (err) => {
            console.error('Error al dar de baja el lote:', err);
            Swal.fire('Error', 'No se pudo procesar la baja del lote.', 'error');
          }
        });
      }
    });
  }

  onClose(): void {
    this.close.emit();
  }
}
