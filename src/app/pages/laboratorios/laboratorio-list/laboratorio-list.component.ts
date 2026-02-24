import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import Swal from 'sweetalert2';
import { Laboratorio } from '../../../core/models/categoria-laboratorio.model';
import { LaboratorioService } from '../../../core/services/laboratorio.service';

@Component({
    selector: 'app-laboratorio-list',
    standalone: false,
    templateUrl: './laboratorio-list.component.html',
    styleUrls: ['./laboratorio-list.component.css']
})
export class LaboratorioListComponent implements OnInit, OnDestroy {

    laboratorios: Laboratorio[] = [];
    loading = false;
    private subscription?: Subscription;

    get activos() {
        return this.laboratorios.filter(l => l.activo).length;
    }

    get inactivos() {
        return this.laboratorios.filter(l => !l.activo).length;
    }

    constructor(private laboratorioService: LaboratorioService) { }

    ngOnInit(): void {
        this.loadLaboratorios();
    }

    ngOnDestroy(): void {
        this.subscription?.unsubscribe();
    }

    // ─── CARGA ─────────────────────────────────────────────────────────────────

    loadLaboratorios(): void {
        this.loading = true;
        this.subscription = this.laboratorioService.getAll().subscribe({
            next: (data) => {
                this.laboratorios = data;
                this.loading = false;
            },
            error: (err) => {
                console.error('❌ Error al cargar laboratorios:', err);
                this.loading = false;
                Swal.fire('Error', 'No se pudieron cargar los laboratorios.', 'error');
            }
        });
    }

    // ─── CREAR / EDITAR ────────────────────────────────────────────────────────

    async abrirFormulario(laboratorio?: Laboratorio): Promise<void> {
        const esEdicion = !!laboratorio;
        const titulo = esEdicion ? 'Editar Laboratorio' : 'Nuevo Laboratorio';

        const { value: formValues } = await Swal.fire({
            title: titulo,
            html: `
        <div style="text-align:left; margin-bottom:12px;">
          <label style="font-size:0.85rem; font-weight:600; color:#475569; display:block; margin-bottom:4px;">
            Nombre <span style="color:#ef4444">*</span>
          </label>
          <input id="swal-input-nombre" class="swal2-input" placeholder="Ej: Genfar"
            value="${esEdicion ? laboratorio!.nombre : ''}"
            style="margin:0; width:100%;">
        </div>
      `,
            showCancelButton: true,
            confirmButtonText: esEdicion ? '💾 Actualizar' : '✅ Crear',
            cancelButtonText: 'Cancelar',
            confirmButtonColor: '#3b82f6',
            cancelButtonColor: '#64748b',
            width: '480px',
            focusConfirm: false,
            preConfirm: () => {
                const nombre = (document.getElementById('swal-input-nombre') as HTMLInputElement).value;
                if (!nombre) {
                    Swal.showValidationMessage('El nombre es requerido');
                    return false;
                }
                return {
                    nombre,
                    descripcion: '',
                    activo: laboratorio ? laboratorio.activo : true
                };
            }
        });

        if (!formValues) return;

        if (esEdicion) {
            this.laboratorioService.update(laboratorio!.id, formValues).subscribe({
                next: () => {
                    Swal.fire({ icon: 'success', title: '✅ Laboratorio actualizado', timer: 1600, showConfirmButton: false });
                    this.loadLaboratorios();
                },
                error: (err) => {
                    console.error('❌ Error al actualizar:', err);
                    Swal.fire('Error', 'No se pudo actualizar el laboratorio.', 'error');
                }
            });
        } else {
            this.laboratorioService.create(formValues).subscribe({
                next: () => {
                    Swal.fire({ icon: 'success', title: '🎉 Laboratorio creado', timer: 1600, showConfirmButton: false });
                    this.loadLaboratorios();
                },
                error: (err) => {
                    console.error('❌ Error al crear:', err);
                    Swal.fire('Error', 'No se pudo crear el laboratorio.', 'error');
                }
            });
        }
    }

    // ─── BORRADO LÓGICO ────────────────────────────────────────────────────────

    toggleEstado(laboratorio: Laboratorio) {
        const accion = laboratorio.activo ? 'desactivar' : 'activar';
        const accionBtn = laboratorio.activo ? 'Desactivar' : 'Activar';
        const btnColor = laboratorio.activo ? '#f59e0b' : '#10b981';

        Swal.fire({
            title: '¿Cambiar estado?',
            text: `¿Estás seguro de ${accion} el laboratorio "${laboratorio.nombre}"?`,
            icon: laboratorio.activo ? 'warning' : 'question',
            showCancelButton: true,
            confirmButtonText: `Sí, ${accion}`,
            cancelButtonText: 'Cancelar',
            confirmButtonColor: btnColor,
            cancelButtonColor: '#64748b'
        }).then((result) => {
            if (!result.isConfirmed) return;

            this.laboratorioService.toggleEstado(laboratorio.id).subscribe({
                next: () => {
                    Swal.fire({
                        icon: 'success',
                        title: 'Estado actualizado',
                        text: `El laboratorio fue ${accion === 'activar' ? 'activado' : 'inactivado'} con éxito.`,
                        timer: 1800,
                        showConfirmButton: false
                    });
                    this.loadLaboratorios();
                },
                error: (err) => {
                    console.error('❌ Error al cambiar estado:', err);
                    Swal.fire('Error', 'No se pudo cambiar el estado.', 'error');
                }
            });
        });
    }
}
