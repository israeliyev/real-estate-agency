import { Pipe, PipeTransform } from '@angular/core';
import {PriceType} from "./enums/PriceType";

@Pipe({
    name: 'priceTypePipe',
    pure: true, // Ensures the pipe runs only when inputs change
})
export class PriceTypePipe implements PipeTransform {
    transform(value: PriceType | undefined): string {
        if (value === undefined || value === null) {
            return 'N/A'; // Default value instead of an empty string
        }

        switch (value) {
            case PriceType.MONTH:
                return 'Ay';
            case PriceType.SALE:
                return '';
            case PriceType.MORTGAGE:
                return 'İpoteka';
            case PriceType.DAY:
                return 'Gün';
            default:
                return 'Bilinməyən';
        }
    }
}
