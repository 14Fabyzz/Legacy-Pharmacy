import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import Swal from 'sweetalert2';
import { ProductService, DashboardAlertas, LoteAlerta, ProductoBajoStock } from '../product.service';

@Component({
    selector: 'app-expiration-dashboard',
    templateUrl: './expiration-dashboard.component.html',
    styleUrls: ['./expiration-dashboard.component.css'],
    standalone: false
})
export class ExpirationDashboardComponent implements OnInit, OnDestroy {

    stats: DashboardAlertas | null = null;

    // Semáforo Rojo: <= 90 días (incluye vencidos con diasRestantes < 0)
    listaRojo: LoteAlerta[] = [];
    // Semáforo Amarillo: 91 a 180 días
    listaAmarillo: LoteAlerta[] = [];
    // Semáforo Verde: Solo KPI, el array siempre llega vacío
    totalVerde: number = 0;
    // Stock Bajo
    listaStockBajo: ProductoBajoStock[] = [];

    activeTab: 'critical' | 'alert' | 'lowstock' | 'healthy' = 'healthy';
    loading: boolean = true;
    error: string | null = null;

    private sub!: Subscription;

    constructor(private productService: ProductService) { }

    ngOnInit(): void {
        this.loadDashboardData();
    }

    ngOnDestroy(): void {
        this.sub?.unsubscribe();
    }

    loadDashboardData(): void {
        this.loading = true;
        this.sub = this.productService.getDashboardAlertas().subscribe({
            next: (data: DashboardAlertas) => {
                console.log('✅ DATA DASHBOARD (Semaforización):', data);
                this.stats = data;
                this.listaRojo = data.rojo || [];
                this.listaAmarillo = data.amarillo || [];
                this.totalVerde = data.totalVerde || 0;
                this.listaStockBajo = data.stockBajo || [];

                // Prioridad de pestaña: Rojo > Amarillo > Stock Bajo > Verde
                if (this.listaRojo.length > 0) {
                    this.activeTab = 'critical';
                } else if (this.listaAmarillo.length > 0) {
                    this.activeTab = 'alert';
                } else if (this.listaStockBajo.length > 0) {
                    this.activeTab = 'lowstock';
                } else {
                    this.activeTab = 'healthy';
                }

                this.loading = false;
            },
            error: (err) => {
                console.error('❌ Error cargando dashboard de alertas:', err);
                this.error = 'No se pudo cargar el panel de alertas.';
                this.loading = false;
            }
        });
    }

    setActiveTab(tab: 'critical' | 'alert' | 'lowstock' | 'healthy'): void {
        this.activeTab = tab;
    }

    /** Retorna true si el lote ya está vencido (diasRestantes negativo) */
    isVencido(lote: LoteAlerta): boolean {
        return lote.diasRestantes < 0;
    }

    darDeBaja(loteId: number): void {
        Swal.fire({
            title: 'Dar de Baja Lote',
            text: 'Seleccione el motivo de la baja formal (se ajustará el stock a 0)',
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
                        this.loadDashboardData();
                    },
                    error: (err) => {
                        console.error('Error al dar de baja el lote:', err);
                        Swal.fire('Error', 'No se pudo procesar la baja del lote. Verifique el estado.', 'error');
                    }
                });
            }
        });
    }
}
