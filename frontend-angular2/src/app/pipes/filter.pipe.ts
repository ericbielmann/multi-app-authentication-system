import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'filter',
  standalone: true
})
export class FilterPipe implements PipeTransform {
  transform(items: any[], searchTerm: string, fields: string[]): any[] {
    if (!items || !searchTerm || searchTerm.trim() === '') {
      return items;
    }

    const lowerSearchTerm = searchTerm.toLowerCase().trim();

    return items.filter(item => {
      return fields.some(field => {
        const fieldValue = item[field];
        if (fieldValue) {
          return fieldValue.toString().toLowerCase().includes(lowerSearchTerm);
        }
        return false;
      });
    });
  }
}
