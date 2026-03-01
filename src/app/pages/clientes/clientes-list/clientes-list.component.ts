import { Component, OnInit, OnDestroy, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { ClienteService, Cliente } from '../../../core/services/cliente.service';
import { ToastService } from '../../../core/services/toast.service';
import { Subject, Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

@Component({
  selector: 'app-clientes-list',
  standalone: false,
  templateUrl: './clientes-list.component.html',
  styleUrls: ['./clientes-list.component.css']
})
export class ClientesListComponent implements OnInit, OnDestroy {
  clientes: Cliente[] = [];
  loading = true;
  searchTerm = '';
  searchSubject = new Subject<string>();
  searchSubscription!: Subscription;

  showDetailModal: boolean = false;
  clienteSeleccionado: Cliente | null = null;

  constructor(
    private clienteService: ClienteService,
    private toastService: ToastService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) { }

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.loadClientes();
    }

    this.searchSubscription = this.searchSubject.pipe(
      debounceTime(400),
      distinctUntilChanged()
    ).subscribe(termino => {
      this.loading = true;
      if (termino.trim().length > 0) {
        this.clienteService.buscar(termino).subscribe({
          next: (clientes) => {
            this.clientes = clientes;
            this.loading = false;
          },
          error: (err) => {
            console.error('Error buscando clientes', err);
            this.toastService.showError('Error al buscar clientes');
            this.loading = false;
          }
        });
      } else {
        this.loadClientes();
      }
    });
  }

  ngOnDestroy(): void {
    if (this.searchSubscription) {
      this.searchSubscription.unsubscribe();
    }
  }

  onSearch(event: any): void {
    const termino = event.target.value;
    this.searchSubject.next(termino);
  }

  loadClientes(): void {
    if (!isPlatformBrowser(this.platformId)) return;

    this.loading = true;
    this.clienteService.getAll().subscribe({
      next: (clientes) => {
        console.log('RAW_CLIENTE_DATA:', clientes.length > 0 ? clientes[0] : 'Vacio');
        this.clientes = clientes;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error cargando clientes', err);
        this.toastService.showError('Error al cargar la lista de clientes');
        this.loading = false;
      }
    });
  }

  isConsumidorFinal(cliente: any): boolean {
    const id = cliente.numeroIdentificacion || cliente.identificacion || cliente.cedula || cliente.numeroDocumento;
    return id === '999999999' || id === '9999999999';
  }

  abrirDetalles(cliente: Cliente): void {
    this.clienteSeleccionado = cliente;
    this.showDetailModal = true;
  }

  cerrarDetalles(): void {
    this.showDetailModal = false;
    this.clienteSeleccionado = null;
  }
}
