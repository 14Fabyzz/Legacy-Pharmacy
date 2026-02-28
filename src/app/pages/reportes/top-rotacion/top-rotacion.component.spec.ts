import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TopRotacionComponent } from './top-rotacion.component';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { ReportesService } from '../../../core/services/reportes.service';
import { of, throwError } from 'rxjs';
import { TopProductoResponse } from '../../../core/models/reportes.models';

describe('TopRotacionComponent', () => {
  let component: TopRotacionComponent;
  let fixture: ComponentFixture<TopRotacionComponent>;
  let reportesServiceMock: jasmine.SpyObj<ReportesService>;

  beforeEach(async () => {
    // Definimos el mock del servicio
    reportesServiceMock = jasmine.createSpyObj('ReportesService', ['getTopRotacion']);

    await TestBed.configureTestingModule({
      declarations: [TopRotacionComponent],
      imports: [ReactiveFormsModule],
      providers: [
        FormBuilder,
        { provide: ReportesService, useValue: reportesServiceMock }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(TopRotacionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges(); // Ejecuta ngOnInit()
  });

  it('debe crearse correctamente e inicializar el formulario con fechas por defecto', () => {
    expect(component).toBeTruthy();
    expect(component.filtroForm).toBeDefined();
    expect(component.filtroForm.get('fechaInicio')?.value).toBeTruthy();
    expect(component.filtroForm.get('fechaFin')?.value).toBeTruthy();
    expect(component.filtroForm.valid).toBeTrue();
  });

  describe('Escenario 1: Búsqueda Exitosa (Con Datos)', () => {
    it('debe actualizar los datos de la tabla, ocultar el loader y configurar el periodo consultado al recibir 200', () => {
      // Configuramos el mock de la respuesta HTTP 200 con datos mock
      const mockDatos: TopProductoResponse[] = [
        { nombreProducto: 'Prod A', presentacion: 'CAJA', totalVendido: 10, ingresoGenerado: 1000 },
        { nombreProducto: 'Prod B', presentacion: 'UNIDAD', totalVendido: 5, ingresoGenerado: 500 }
      ];
      
      reportesServiceMock.getTopRotacion.and.returnValue(of(mockDatos));

      // Asignamos las fechas manualmente para evitar dependencias de la ejecución de pruebas (zona horaria)
      const testFechaInicio = '2026-01-01';
      const testFechaFin = '2026-01-31';

      component.filtroForm.patchValue({
        fechaInicio: testFechaInicio,
        fechaFin: testFechaFin,
        limite: 10
      });

      // Ejecutamos el método
      component.generarReporte();

      // Afirmaciones (Assertions)
      expect(reportesServiceMock.getTopRotacion).toHaveBeenCalledWith(testFechaInicio, testFechaFin, 10);
      expect(component.isLoading).toBeFalse();
      expect(component.error).toBeNull();
      expect(component.topProductos.length).toBe(2);
      expect(component.topProductos).toEqual(mockDatos);
      expect(component.periodoConsultado).toEqual({ inicio: testFechaInicio, fin: testFechaFin });
    });
  });

  describe('Escenario 2: Búsqueda Sin Ventas (Genera Error HTTP 404)', () => {
    it('debe limpiar los resultados previos, ocultar el loader interceptando el 404, y evitar mostrar errores genéricos', () => {
      // Estado pre-existente para comprobar que se limpia (datos "fantasma" de búsquedas anteriores)
      component.topProductos = [{ nombreProducto: 'Ghost', presentacion: 'UNIDAD', totalVendido: 1, ingresoGenerado: 1 }];
      component.hasSearched = true;

      const testFechaInicio = '2026-02-01';
      const testFechaFin = '2026-02-28';

      component.filtroForm.patchValue({
        fechaInicio: testFechaInicio,
        fechaFin: testFechaFin,
        limite: 10
      });

      // Simulamos la intercepción de request que retorna un 404 vacio desde el backend
      const errorResponse = { status: 404, message: 'Not Found' };
      reportesServiceMock.getTopRotacion.and.returnValue(throwError(() => errorResponse));

      // Disparamos la búsqueda
      component.generarReporte();

      // Afirmamos los resultados post-bloque de error
      expect(component.isLoading).toBeFalse(); // El loader debió apagarse
      
      // EL PUNTO CLAVE 1: No debe existir mensaje de error genérico.
      expect(component.error).toBeNull();
      
      // EL PUNTO CLAVE 2: La tabla antigua se tuvo que limpiar primero.
      expect(component.topProductos.length).toBe(0); 
      
      // EL PUNTO CLAVE 3: El periodo se asignó para que Angular pueda renderizar el mensaje de "vaciado" dinámico.
      expect(component.periodoConsultado).toEqual({ inicio: testFechaInicio, fin: testFechaFin });
    });

    it('debe mostrar el mensaje de error genérico SÓLO si es un error HTTP distinto a 404 (e.g. 500)', () => {
      component.filtroForm.patchValue({ fechaInicio: '2026-01-01', fechaFin: '2026-01-31', limite: 10 });

      // Error 500 de caída de servidor
      const errorResponse = { status: 500, message: 'Internal Server Error' };
      reportesServiceMock.getTopRotacion.and.returnValue(throwError(() => errorResponse));

      component.generarReporte();

      expect(component.isLoading).toBeFalse();
      // En este caso contrario, sí debe setearse la variable global error
      expect(component.error).toBe('Ocurrió un error al cargar el reporte. Por favor, intenta nuevamente.');
      // Y no asigna contexto de periodo para que no salgan tableros mezclados con errores severos
      // El componente en la refactorización seteó el null antes y no lo re-asignó por el else()
      expect(component.periodoConsultado).toBeNull(); 
    });
  });
});
