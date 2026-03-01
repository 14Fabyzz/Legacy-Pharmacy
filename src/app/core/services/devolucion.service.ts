import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface ItemDevolucionDTO {
  productoId: number;
  cantidad: number;
  motivoDetalle?: string;
  destinoProducto?: string;
}

export interface DevolucionRequestDTO {
  items: ItemDevolucionDTO[];
}

@Injectable({
  providedIn: 'root'
})
export class DevolucionService {
  constructor(private http: HttpClient) { }

  procesarDevolucion(idVenta: number | string, payload: DevolucionRequestDTO): Observable<any> {
    return this.http.post(`${environment.apiUrl}/api/v1/ventas/${idVenta}/devolucion`, payload);
  }
}
