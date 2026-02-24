import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
    selector: 'app-tabs-nav',
    standalone: true,
    imports: [CommonModule, RouterModule],
    templateUrl: './tabs-nav.component.html',
    styleUrls: ['./tabs-nav.component.css']
})
export class TabsNavComponent {
    navItems = [
        { label: 'ALMACÉN', link: '/app/productos/almacen', icon: '📦' },
        { label: 'CONSULTA', link: '/app/productos/consulta', icon: '🔍' },
        { label: 'MONITOR ALERTAS', link: '/app/productos/vencimientos', icon: '🚨' },
        { label: 'ENTRADAS', link: '/app/productos/entrada-mercancia', icon: '🚚' },
        { label: 'NUEVO', link: '/app/productos/nuevo', icon: '✨' },
        { label: 'CATEGORÍAS', link: '/app/categorias', icon: '🏷️' },
        { label: 'LABORATORIOS', link: '/app/laboratorios', icon: '🔬' }
    ];
}
