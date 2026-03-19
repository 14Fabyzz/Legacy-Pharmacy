import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import Swal from 'sweetalert2';
import { Categoria } from '../../../core/models/categoria-laboratorio.model';
import { CategoriaService } from '../../../core/services/categoria.service';

@Component({
    selector: 'app-categoria-list',
    standalone: false,
    templateUrl: './categoria-list.component.html',
    styleUrls: ['./categoria-list.component.css']
})
export class CategoriaListComponent implements OnInit, OnDestroy {

    categorias: Categoria[] = [];
    loading = false;
    private subscription?: Subscription;

    /** Getter: cantidad de categorías activas */
    get activas(): number {
        return this.categorias.filter(c => c.activa).length;
    }

    get inactivas(): number {
        return this.categorias.filter(c => !c.activa).length;
    }

    constructor(private categoriaService: CategoriaService) { }

    ngOnInit(): void {
        this.loadCategorias();
    }

    ngOnDestroy(): void {
        this.subscription?.unsubscribe();
    }

    // ─── CARGA DE DATOS ────────────────────────────────────────────────────────

    loadCategorias(): void {
        this.loading = true;
        this.subscription = this.categoriaService.getAll().subscribe({
            next: (data) => {
                this.categorias = data;
                this.loading = false;
            },
            error: (err) => {
                console.error('❌ Error al cargar categorías:', err);
                this.loading = false;
                Swal.fire('Error', 'No se pudieron cargar las categorías.', 'error');
            }
        });
    }

    // ─── CREAR / EDITAR ────────────────────────────────────────────────────────

    /**
     * Abre un modal SweetAlert2 para crear o editar una categoría.
     * @param categoria Si se pasa, se pre-rellena el formulario para edición.
     */
    async abrirFormulario(categoria?: Categoria): Promise<void> {
        const esEdicion = !!categoria;
        const titulo = esEdicion ? 'Editar Categoría' : 'Nueva Categoría';

        const { value: formValues } = await Swal.fire({
            title: titulo,
            html: `
        <div style="text-align:left; margin-bottom:12px;">
          <label style="font-size:0.85rem; font-weight:600; color:#475569; display:block; margin-bottom:4px;">
            Nombre <span style="color:#ef4444">*</span>
          </label>
          <input id="swal-input-nombre" class="swal2-input" placeholder="Ej: Analgésicos"
            value="${esEdicion ? categoria!.nombre : ''}"
            style="margin:0; width:100%;">
        </div>
        <div style="text-align:left;">
          <label style="font-size:0.85rem; font-weight:600; color:#475569; display:block; margin-bottom:4px;">
            Descripción
          </label>
          <textarea id="swal-input-descripcion" class="swal2-textarea" placeholder="Descripción breve de la categoría..."
            style="margin:0; width:100%; resize:vertical; min-height:80px;">${esEdicion ? categoria!.descripcion : ''}</textarea>
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
                const nombre = (document.getElementById('swal-input-nombre') as HTMLInputElement).value.trim();
                const descripcion = (document.getElementById('swal-input-descripcion') as HTMLTextAreaElement).value.trim();

                if (!nombre) {
                    Swal.showValidationMessage('⚠️ El nombre es obligatorio');
                    return null;
                }
                return {
                    nombre,
                    descripcion: descripcion || '',
                    activa: categoria ? categoria.activa : true // Mantener estado si es edición, por defecto true si es nuevo
                };
            }
        });

        if (!formValues) return; // Cancelado o validación fallida

        if (esEdicion) {
            this.categoriaService.update(categoria!.id, formValues).subscribe({
                next: () => {
                    Swal.fire({ icon: 'success', title: '✅ Categoría actualizada', timer: 1600, showConfirmButton: false });
                    this.loadCategorias();
                },
                error: (err) => {
                    console.error('❌ Error al actualizar:', err);
                    Swal.fire('Error', 'No se pudo actualizar la categoría.', 'error');
                }
            });
        } else {
            this.categoriaService.create(formValues).subscribe({
                next: () => {
                    Swal.fire({ icon: 'success', title: '🎉 Categoría creada', timer: 1600, showConfirmButton: false });
                    this.loadCategorias();
                },
                error: (err) => {
                    console.error('❌ Error al crear:', err);
                    Swal.fire('Error', 'No se pudo crear la categoría.', 'error');
                }
            });
        }
    }

    // ─── BORRADO LÓGICO ────────────────────────────────────────────────────────

    toggleEstado(categoria: Categoria): void {
        const accion = categoria.activa ? 'desactivar' : 'activar';
        const icono = categoria.activa ? 'warning' : 'question';
        const btnColor = categoria.activa ? '#f59e0b' : '#10b981';

        Swal.fire({
            title: '¿Cambiar estado?',
            html: `Vas a <strong>${accion}</strong> la categoría:<br><em>${categoria.nombre}</em>`,
            icon: icono,
            showCancelButton: true,
            confirmButtonText: `Sí, ${accion}`,
            cancelButtonText: 'Cancelar',
            confirmButtonColor: btnColor,
            cancelButtonColor: '#64748b'
        }).then((result) => {
            if (!result.isConfirmed) return;

            this.categoriaService.toggleEstado(categoria.id).subscribe({
                next: () => {
                    Swal.fire({
                        icon: 'success',
                        title: 'Estado actualizado',
                        text: `La categoría fue ${accion === 'activar' ? 'activada' : 'inactivada'} con éxito.`,
                        timer: 1800,
                        showConfirmButton: false
                    });
                    this.loadCategorias();
                },
                error: (err) => {
                    console.error('❌ Error al cambiar estado:', err);
                    Swal.fire('Error', 'No se pudo cambiar el estado.', 'error');
                }
            });
        });
    }
}
