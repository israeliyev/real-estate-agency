import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'filterByType' })
export class FilterByTypePipe implements PipeTransform {
  transform(items: any[], type: string): any[] {
    return items.filter(item => item.type === type);
  }
}
