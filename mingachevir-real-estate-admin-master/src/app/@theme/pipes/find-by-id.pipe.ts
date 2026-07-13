import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'findById' })
export class FindByIdPipe implements PipeTransform {
  transform(items: any[], id: number): any {
    return items.find(item => item.id === id);
  }
}
