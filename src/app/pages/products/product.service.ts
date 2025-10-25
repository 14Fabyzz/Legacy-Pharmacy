import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { observable } from 'rxjs';


@Injectable({
  providedIn: 'root'
})
export class ProductService {

  private apiUrl = 'http://localhost:8080/api'; // Reemplaza con tu URL de API real
  constructor(private http: HttpClient) { }

  getProducts() {
    return this.http.get<any[]>(`${this.apiUrl}/productos`);
  }

  // Aquí puedes añadir tus otros métodos:
  // getProductById(id: string): Observable<any> { ... }
  // createProduct(product: any): Observable<any> { ... }
  // updateProduct(id: string, product: any): Observable<any> { ... }
}
