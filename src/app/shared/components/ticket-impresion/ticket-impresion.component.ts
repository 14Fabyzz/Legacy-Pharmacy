import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { TicketData } from './ticket-data.model';

@Component({
    selector: 'app-ticket-impresion',
    standalone: true,
    imports: [CommonModule, CurrencyPipe, DatePipe],
    templateUrl: './ticket-impresion.component.html',
    styleUrls: ['./ticket-impresion.component.css']
})
export class TicketImpresionComponent {

    // Recibimos el molde estricto con todo precalculado
    @Input() ticket!: TicketData;
    @Input() mostrarModal: boolean = false;
    @Output() cerrar = new EventEmitter<void>();

    imprimirFactura(): void {
        window.print();
    }

    cerrarModal(): void {
        this.cerrar.emit();
    }
}
