import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SidebarService {
  // BehaviorSubject para mantener el estado de colapso. Inicia en 'false' (visible).
  private isCollapsed = new BehaviorSubject<boolean>(false);

  // Observable público para que los componentes puedan suscribirse a los cambios.
  public isCollapsed$ = this.isCollapsed.asObservable();

  constructor() { }

  // Método para cambiar el estado.
  toggle() {
    this.isCollapsed.next(!this.isCollapsed.value);
  }
}