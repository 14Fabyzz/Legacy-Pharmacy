import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'search', // Este es el nombre que usaremos en el HTML
  standalone: true
})
export class SearchPipe implements PipeTransform {

  transform(items: any[], searchText: string): any[] {
    // Si no hay items o no hay texto de búsqueda, devuelve la lista original
    if (!items) {
      return [];
    }
    if (!searchText) {
      return items;
    }

    // Convierte el texto de búsqueda a minúsculas para una búsqueda sin distinción de mayúsculas/minúsculas
    searchText = searchText.toLowerCase();

    // Filtra los items
    return items.filter(item => {
      // Convierte el objeto a una cadena de texto en minúsculas y verifica si incluye el texto de búsqueda
      return JSON.stringify(item).toLowerCase().includes(searchText);
    });
  }

}