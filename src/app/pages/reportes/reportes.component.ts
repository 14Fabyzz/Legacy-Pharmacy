import { Component, OnInit } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { Router } from '@angular/router';

interface ReporteOption {
    titulo: string;
    descripcion: string;
    ruta: string;
    svgIcon: SafeHtml;
}

@Component({
    selector: 'app-reportes',
    standalone: false,
    templateUrl: './reportes.component.html',
    styleUrls: ['./reportes.component.css']
})
export class ReportesComponent implements OnInit {

    opcionesReportes: ReporteOption[] = [];

    constructor(
        private sanitizer: DomSanitizer,
        public router: Router
    ) {}

    get isReportesHome(): boolean {
        return this.router.url === '/app/reportes';
    }

    ngOnInit(): void {
    }
}
