import {Component, OnInit} from '@angular/core';
import {BrokerDto} from "../models/BrokerDto";
import {HouseService} from "../service/HouseService";
import {HttpStatusCode} from "../util/HttpStatusCode";
import {ActivatedRoute, Router} from "@angular/router";
import {BasketService} from "../service/basket.service";
import {Subscription} from "rxjs";
import {ToastrService} from "ngx-toastr";

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['navbar.component.css']
})
export class NavbarComponent implements OnInit {
  brokerInformation: BrokerDto | undefined;
  basketCount: number = 0;
  searchKey: string = '';
  private basketSubscription!: Subscription;

  constructor(private houseService: HouseService,
              private router: Router,
              private basketService: BasketService,
              private toaster: ToastrService,
              private activatedRoute: ActivatedRoute) {

  }

  ngOnInit(): void {
    this.getBrokerInformation();
    this.basketSubscription = this.basketService.basket$.subscribe(basket => {
      this.basketCount = basket.length;
    });

    this.activatedRoute.queryParams.subscribe(params => {
      const searchKey = params['searchKey'];
      if (searchKey) {
        this.searchKey = searchKey;
      }
    });
  }

  searchProducts() {
    this.router.navigate(["/evler"], {
      queryParams: {
        searchKey: this.searchKey.slice(0, 256)
      }
    });
  }

  getBrokerInformation() {
    this.houseService.getBrokerInformation().subscribe({
      next: (result) => {
        if (result.responseStatus === HttpStatusCode.OK) {
          this.brokerInformation = result.data;
        } else {
          this.brokerInformation = undefined;
          console.warn('Unexpected response status:', result.responseStatus);
        }
      },
      error: (err) => {
        this.brokerInformation = undefined;
        console.error('Error fetching broker information:', err);
      }
    });
  }


  goBasket() {
    if (this.basketCount > 0) {
      this.router.navigate(["/sebet"]);
    } else {
      this.toaster.success("Seçilmişlərdə Məhsul Yoxdur!", "Məlumat")
    }
  }
}


