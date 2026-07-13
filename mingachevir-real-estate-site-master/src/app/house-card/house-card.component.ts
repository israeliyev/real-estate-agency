import {Component, Input, OnDestroy, OnInit} from '@angular/core';
import {BasketService} from "../service/basket.service";
import {Subscription} from "rxjs";
import {HouseCardDto} from "../models/HouseCardDto";
import {Router} from "@angular/router";
import {AnalyticsService} from "../service/analytics.service";

@Component({
  selector: 'app-house-card',
  templateUrl: './house-card.component.html',
  styleUrls: ['./house-card.component.css'],
})
export class HouseCardComponent implements OnInit, OnDestroy {
  @Input() house!: HouseCardDto;
  isInBasket = false;
  private basketSubscription!: Subscription;

  constructor(private basketService: BasketService,
              private router: Router,
              private analyticsService: AnalyticsService) {
  }

  ngOnInit() {
    this.basketSubscription = this.basketService.basket$.subscribe(basket => {
      this.isInBasket = basket.some(item => item.id === this.house.id);
    });
  }

  ngOnDestroy() {
    if (this.basketSubscription) {
      this.basketSubscription.unsubscribe();
    }
  }

  openHouseDetail(houseId: number): void {
    const url = this.router.createUrlTree(['/ev-haqqinda'], {queryParams: {houseId}}).toString();
    window.open(url, '_blank', 'noopener');
  }

  addToBasket() {
    this.isInBasket = true;
    this.basketService.addToBasket(this.house);
    const sessionId = this.getSessionId();
    this.analyticsService.trackBasketAddition(this.house.id, sessionId).subscribe();
  }

  removeFromBasket() {
    this.isInBasket = false;
    if (this.house.id !== undefined) {
      this.basketService.removeFromBasket(this.house.id);
    }
  }

  private getSessionId(): string {
    let sessionId = localStorage.getItem('sessionId');
    if (!sessionId) {
      sessionId = 'session-' + Math.random().toString(36).substr(2, 9);
      localStorage.setItem('sessionId', sessionId);
    }
    return sessionId;
  }
}
