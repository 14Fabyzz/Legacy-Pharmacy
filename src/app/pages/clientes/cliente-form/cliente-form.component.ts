import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ClienteService, Cliente } from '../../../core/services/cliente.service';
import { ToastService } from '../../../core/services/toast.service';

@Component({
  selector: 'app-cliente-form',
  standalone: false,
  templateUrl: './cliente-form.component.html',
  styleUrls: ['./cliente-form.component.css']
})
export class ClienteFormComponent implements OnInit {
  @Input() isModal: boolean = false;
  @Output() clienteGuardado = new EventEmitter<any>();
  @Output() cancelar = new EventEmitter<void>();

  clienteForm: FormGroup;
  isEditMode = false;
  clienteId?: number;
  submitted = false;
  loading = false;
  dataLoading = false;
  error: string | null = null;
  originalActivoState = true;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private clienteService: ClienteService,
    private toastService: ToastService
  ) {
    this.clienteForm = this.fb.group({
      nombre: ['', Validators.required],
      apellido: ['', Validators.required],
      numeroIdentificacion: ['', [Validators.required, Validators.pattern('^[0-9]+$')]],
      email: ['', [Validators.required, Validators.email]],
      telefono: ['', [Validators.pattern('^[0-9+ ]+$')]],
      tipoCliente: ['REGULAR'],
      activo: [true]
    });
  }

  ngOnInit(): void {
    this.clienteId = Number(this.route.snapshot.paramMap.get('id'));
    this.isEditMode = !!this.clienteId;

    if (this.isEditMode) {
      this.loadCliente(this.clienteId!);
    }
  }

  private loadCliente(id: number): void {
    this.dataLoading = true;

    this.clienteService.getAll().subscribe({
      next: (clientes) => {
        this.dataLoading = false;
        const cliente = clientes.find(c => c.id === id);
        if (cliente) {
          if (cliente.numeroIdentificacion === '999999999' || cliente.numeroIdentificacion === '9999999999') {
            this.toastService.showWarning('El consumidor final no puede ser modificado.');
            this.router.navigate(['/app/clientes']);
            return;
          }

          this.clienteForm.patchValue({
            nombre: cliente.nombre,
            apellido: cliente.apellido,
            numeroIdentificacion: cliente.numeroIdentificacion,
            email: cliente.email,
            telefono: cliente.telefono || '',
            tipoCliente: cliente.tipoCliente || 'REGULAR',
            activo: cliente.estado === 'ACTIVO' || cliente.activo
          });
          this.originalActivoState = cliente.estado === 'ACTIVO' || cliente.activo;
        } else {
          this.error = 'Cliente no encontrado';
        }
      },
      error: () => {
        this.dataLoading = false;
        this.toastService.showError('Error al cargar los datos del cliente.');
      }
    });
  }

  get f() { return this.clienteForm.controls; }

  onSubmit(): void {
    this.submitted = true;
    this.error = null;

    if (this.clienteForm.invalid) {
      return;
    }

    this.loading = true;
    const formValue = this.clienteForm.value;
    const clienteData: any = {
      nombre: formValue.nombre,
      apellido: formValue.apellido,
      numeroIdentificacion: formValue.numeroIdentificacion,
      email: formValue.email,
      telefono: formValue.telefono,
      tipoCliente: formValue.tipoCliente,
      estado: formValue.activo ? 'ACTIVO' : 'INACTIVO'
    };

    if (this.isEditMode && this.clienteId) {
      this.clienteService.update(this.clienteId, clienteData).subscribe({
        next: (res) => {
          this.toastService.showSuccess('¡Cliente actualizado correctamente!');
          if (this.isModal) {
            this.clienteGuardado.emit(res);
          } else {
            this.router.navigate(['/app/clientes']);
          }
        },
        error: () => {
          this.toastService.showError('Error al actualizar cliente');
          this.loading = false;
        }
      });
    } else {
      this.clienteService.create(clienteData).subscribe({
        next: (res) => {
          this.toastService.showSuccess('¡Cliente registrado correctamente!');
          if (this.isModal) {
            this.clienteGuardado.emit(res);
          } else {
            this.router.navigate(['/app/clientes']);
          }
        },
        error: () => {
          this.toastService.showError('Error al crear el cliente');
          this.loading = false;
        }
      });
    }
  }

  onCancel(): void {
    if (this.isModal) {
      this.cancelar.emit();
    } else {
      this.router.navigate(['/app/clientes']);
    }
  }
}
