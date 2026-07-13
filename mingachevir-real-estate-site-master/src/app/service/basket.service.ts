import {Injectable} from '@angular/core';
import {BehaviorSubject} from 'rxjs';
import {HouseCardDto} from "../models/HouseCardDto";


@Injectable({
  providedIn: 'root'
})
export class BasketService {
  private basketKey = 'basketItems';
  private basket = new BehaviorSubject<HouseCardDto[]>(this.loadFromLocalStorage());
  basket$ = this.basket.asObservable();

  constructor() {

  }

  addToBasket(house: HouseCardDto) {
    if (!!house) {
      const currentBasket = this.basket.value;
      if (!currentBasket.some(item => item.id === house.id)) {
        const updatedHouse = {...house, inBasket: true};
        const newBasket = [...currentBasket, updatedHouse];
        this.basket.next(newBasket);
        this.saveToLocalStorage(newBasket);
      }
    }
  }

  removeFromBasket(houseId: number) {
    const currentBasket = this.basket.value;
    const updatedBasket = currentBasket.filter(item => item.id !== houseId);
    this.basket.next(updatedBasket);
    this.saveToLocalStorage(updatedBasket);
  }

  private loadFromLocalStorage(): HouseCardDto[] {
    const storedBasket = localStorage.getItem(this.basketKey);
    return storedBasket ? JSON.parse(storedBasket) : [];
  }

  private saveToLocalStorage(basket: HouseCardDto[]) {
    localStorage.setItem(this.basketKey, JSON.stringify(basket));
  }
}
