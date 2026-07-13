import {Component, OnInit} from '@angular/core';
import {Subscription} from "rxjs";
import {BasketService} from "../service/basket.service";
import {HouseCardDto} from "../models/HouseCardDto";

@Component({
  selector: 'app-basket',
  templateUrl: './basket.component.html',
  styleUrls: ['./basket.component.css']
})
export class BasketComponent implements OnInit {
  houses: HouseCardDto[] = [];
  private basketSubscription!: Subscription;

  constructor(private basketService: BasketService) {
  }

  ngOnInit() {
    this.basketSubscription = this.basketService.basket$.subscribe(basket => {
      this.houses = basket ?? [];
    });
  }
}
