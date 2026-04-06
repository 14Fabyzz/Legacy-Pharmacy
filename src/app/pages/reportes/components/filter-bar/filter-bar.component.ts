import { Component, OnInit, Input, Output, EventEmitter, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

export interface FilterDateRange {
  fechaInicio: string;
  fechaFin: string;
}

@Component({
  selector: 'app-filter-bar',
  templateUrl: './filter-bar.component.html',
  styleUrls: ['./filter-bar.component.css'],
  standalone: false
})
export class FilterBarComponent implements OnInit, OnDestroy {
  @Output() filterChanged = new EventEmitter<FilterDateRange>();

  filtrosIAForm!: FormGroup;
  opcionesPeriodicidad: string[] = ['DIARIO', 'SEMANAL', 'MENSUAL', 'PERSONALIZADO'];
  private destroy$ = new Subject<void>();

  constructor(private fb: FormBuilder) {}

  ngOnInit(): void {
    this.initForm();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private initForm() {
    const hoy = new Date();
    const inicioMes = new Date(hoy.getFullYear(), hoy.getMonth(), 1);
    
    this.filtrosIAForm = this.fb.group({
      periodicidad: ['MENSUAL', Validators.required],
      fechaInicio: [{ value: inicioMes.toISOString().split('T')[0], disabled: true }, Validators.required],
      fechaFin: [{ value: hoy.toISOString().split('T')[0], disabled: true }, Validators.required]
    });

    this.filtrosIAForm.get('periodicidad')?.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(value => {
        const fechaInicioControl = this.filtrosIAForm.get('fechaInicio');
        const fechaFinControl = this.filtrosIAForm.get('fechaFin');
        const newHoy = new Date();
        let newInicio = new Date();

        if (value === 'PERSONALIZADO') {
          fechaInicioControl?.enable();
          fechaFinControl?.enable();
          return; // No emitimos automáticamente al cambiar a personalizado, el usuario debe aplicar o editar
        }

        fechaInicioControl?.disable();
        fechaFinControl?.disable();

        if (value === 'DIARIO') {
          newInicio = new Date();
        } else if (value === 'SEMANAL') {
          newInicio.setDate(newHoy.getDate() - 7);
        } else if (value === 'MENSUAL') {
          newInicio = new Date(newHoy.getFullYear(), newHoy.getMonth(), 1);
        }

        fechaInicioControl?.setValue(newInicio.toISOString().split('T')[0], { emitEvent: false });
        fechaFinControl?.setValue(newHoy.toISOString().split('T')[0], { emitEvent: false });
        
        this.emitirFiltros();
      });

    // Emit initial values
    setTimeout(() => this.emitirFiltros());
  }

  aplicarFiltroSeleccionado() {
    this.emitirFiltros();
  }

  private emitirFiltros() {
    const controles = this.filtrosIAForm.getRawValue();
    this.filterChanged.emit({
      fechaInicio: controles.fechaInicio,
      fechaFin: controles.fechaFin
    });
  }
}
