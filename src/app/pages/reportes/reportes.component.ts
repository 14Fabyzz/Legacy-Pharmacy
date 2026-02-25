import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';

@Component({
    selector: 'app-reportes',
    standalone: false,
    template: '<router-outlet></router-outlet>',
    styles: [':host { display: block; }']
})
export class ReportesComponent { }
