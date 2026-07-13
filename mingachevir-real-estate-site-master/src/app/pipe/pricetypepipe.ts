import {Pipe, PipeTransform} from '@angular/core';
import {PriceType} from "../util/PriceType";

@Pipe({
  name: 'priceType'
})
export class PriceTypePipe implements PipeTransform {
  transform(value: PriceType | undefined | null, ...args: any[]): string {
    if (!value) {
      return '';
    }

    const priceType = value as PriceType;
    switch (priceType) {
      case PriceType.MONTH:
        return '/Ay';
      case PriceType.SALE:
        return '';
      case PriceType.MORTGAGE:
        return '/İpoteka';
      case PriceType.DAY:
        return '/Günlük';
      default:
        return '';
    }
  }
}
