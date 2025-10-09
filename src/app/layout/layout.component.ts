import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { SidebarService } from '../core/services/sidebar.service';

// 1. Importa los componentes necesarios
import { SidebarComponent } from '../shared/sidebar/sidebar.component';
import { HeaderComponent } from '../shared/header/header.component'; 
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-layout',
  standalone: true, // Lo convertimos a Standalone
  imports: [
    CommonModule,      // Necesario para [ngClass]
    RouterModule,      // Necesario para <router-outlet>
    SidebarComponent,  // 2. Añade SidebarComponent aquí
    HeaderComponent    // 3. Añade HeaderComponent aquí
  ],
  templateUrl: './layout.component.html',
  styleUrls: ['./layout.component.css']
})
export class LayoutComponent implements OnInit, OnDestroy {
  
  isCollapsed = false;
  private sidebarSubscription!: Subscription;

  constructor(private sidebarService: SidebarService) { }

  ngOnInit(): void {
    this.sidebarSubscription = this.sidebarService.isCollapsed$.subscribe(
      collapsed => {
        this.isCollapsed = collapsed;
      }
    );
  }

  ngOnDestroy(): void {
    if (this.sidebarSubscription) {
      this.sidebarSubscription.unsubscribe();
    }
  }
}