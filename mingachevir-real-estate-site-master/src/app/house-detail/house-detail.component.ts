import {Component, ElementRef, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {HouseService} from '../service/HouseService';
import {HouseDto} from '../models/HouseDto';
import {Subscription} from 'rxjs';
import {BasketService} from '../service/basket.service';
import {HouseCardDto} from '../models/HouseCardDto';
import {PriceType} from '../util/PriceType';
import {BaseIdNameValue} from '../models/BaseIdNameValue';
import {AnalyticsService} from '../service/analytics.service';
import {HttpStatusCode} from "@angular/common/http";
import {ToastrService} from "ngx-toastr";
import {DomSanitizer, SafeHtml} from "@angular/platform-browser";

@Component({
  selector: 'app-house-detail',
  templateUrl: './house-detail.component.html',
  styleUrls: ['./house-detail.component.css']
})
export class HouseDetailComponent implements OnInit, OnDestroy {
  houseDetail: HouseDto | null = null;
  isInBasket = false;
  priceParameter: BaseIdNameValue = {};
  locationParameter: BaseIdNameValue = {};
  inputParameters: BaseIdNameValue[] = [];
  selectParameters: BaseIdNameValue[] = [];
  currentSlideIndex: number = 0;
  mediaItems: { type: 'video' | 'image'; path: string }[] = [];
  @ViewChild('carousel') carouselRef!: ElementRef;
  loading: boolean = false;
  private basketSubscription!: Subscription;

  constructor(
    private route: ActivatedRoute,
    private houseService: HouseService,
    private basketService: BasketService,
    private analyticsService: AnalyticsService,
    private toaster: ToastrService,
    private sanitizer: DomSanitizer
  ) {
  }

  get formattedDescription(): SafeHtml {
    if (!this.houseDetail || !this.houseDetail.description) {
      return 'Açıqlama yoxdur';
    }
    const html = this.houseDetail.description.replace(/\n/g, '<br>');
    return this.sanitizer.bypassSecurityTrustHtml(html);
  }


  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      const id = params['houseId'];
      if (id) {
        const parsedId = +id;
        if (!isNaN(parsedId)) {
          this.basketSubscription = this.basketService.basket$.subscribe(basket => {
            this.isInBasket = !!basket.find(item => item.id === parsedId);
          });
          this.loadHouseDetails(parsedId);
        } else {
          this.handleInvalidId();
        }
      } else {
        this.handleInvalidId();
      }
    });
  }

  addToBasket(): void {
    if (!this.houseDetail) return;
    const hc: HouseCardDto | undefined = this.convertHouseDtoToHouseCardDto(this.houseDetail);
    if (hc) {
      this.basketService.addToBasket(hc);
      if (this.houseDetail.id) {
        const sessionId = this.getSessionId();
        this.analyticsService.trackBasketAddition(this.houseDetail.id, sessionId).subscribe();
      }
    }
  }

  convertHouseDtoToHouseCardDto(houseDto: HouseDto | null): HouseCardDto | undefined {
    if (!houseDto) {
      return undefined;
    }

    return {
      id: houseDto.id ?? 0,
      name: houseDto.name ?? '',
      price: houseDto.price ?? null,
      priceType: houseDto.priceType as unknown as PriceType ?? null,
      location: houseDto.location ?? null,
      coverImage: houseDto.coverImage ?? null,
      createDate: houseDto.createDate ?? new Date(),
    };
  }

  removeFromBasket(): void {
    if (!this.houseDetail || this.houseDetail.id === undefined) return;
    this.basketService.removeFromBasket(this.houseDetail.id);
  }

  ngOnDestroy(): void {
    if (this.basketSubscription) {
      this.basketSubscription.unsubscribe();
    }
  }

  loadHouseDetails(houseId: number): void {
    this.loading = true;
    this.houseService.getHouseDetail(houseId).subscribe({
      next: (response) => {
        if (response.responseStatus === HttpStatusCode.Ok) {
          this.houseDetail = response.data ?? null;
          if (!this.houseDetail) {
            this.handleNoData();
          } else {
            this.assignParameters();
            this.initializeMediaItems();
          }
        } else {
          console.error('Error loading house details');
          this.toaster.error("Ev məlumatları yülnərkən xəta baş verdi", "Xəta")
        }
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading house details:', error);
        this.handleNoData();
        this.loading = false;
        this.toaster.error("Ev məlumatları yülnərkən xəta baş verdi", "Xəta")
      }
    });
  }


  prevSlide(): void {
    if (this.currentSlideIndex > 0) {
      this.currentSlideIndex--;
    } else {

      this.currentSlideIndex = this.mediaItems.length - 1;
    }
  }

  nextSlide(): void {
    if (this.currentSlideIndex < this.mediaItems.length - 1) {
      this.currentSlideIndex++;
    } else {

      this.currentSlideIndex = 0;
    }
  }


  selectMedia(index: number): void {
    if (index >= 0 && index < this.mediaItems.length) {
      this.currentSlideIndex = index;
    }
  }

  private handleInvalidId(): void {
    this.houseDetail = null;


  }

  private handleNoData(): void {
    this.houseDetail = null;


  }

  private getSessionId(): string {
    let sessionId = localStorage.getItem('sessionId');
    if (!sessionId) {
      sessionId = 'session-' + Math.random().toString(36).substr(2, 9);
      localStorage.setItem('sessionId', sessionId);
    }
    return sessionId;
  }

  private assignParameters(): void {
    if (!this.houseDetail) {
      this.inputParameters = [];
      this.selectParameters = [];
      this.priceParameter = {};
      this.locationParameter = {};
      return;
    }

    // Fix 4: use optional chaining + nullish coalescing on all nested properties
    this.inputParameters = (this.houseDetail.inputParameters ?? [])
      .filter(param =>
        param?.parameter?.name &&
        !['PRICE'].includes(param?.parameter?.code ?? '')
      )
      .map(param => ({
        name: param?.parameter?.name ?? '',
        value: param?.value != null ? String(param.value) : '',
      }));

    this.selectParameters = (this.houseDetail.selectiveParameters ?? [])
      .filter(param =>
        param?.parameter?.name &&
        !['LOCATION'].includes(param?.parameter?.code ?? '')
      )
      .map(param => ({
        name: param?.parameter?.name ?? '',
        value: param?.name ?? '',
      }));

    const priceParam = (this.houseDetail.inputParameters ?? []).find(
      param => param?.parameter?.code === 'PRICE'
    );
    this.priceParameter = priceParam
      ? {
        name: priceParam?.parameter?.name ?? '',
        value: priceParam?.value != null ? String(priceParam.value) : ''
      }
      : {};

    const locationParam = (this.houseDetail.selectiveParameters ?? []).find(
      param => param?.parameter?.code === 'LOCATION'
    );
    this.locationParameter = locationParam
      ? {
        name: locationParam?.parameter?.name ?? '',
        value: locationParam?.name ?? ''
      }
      : {};

    if (this.houseDetail.id) {
      const sessionId = this.getSessionId();
      this.analyticsService.trackHouseView(this.houseDetail.id, sessionId).subscribe();
    }
  }


  private initializeMediaItems(): void {
    this.mediaItems = [];
    if (!this.houseDetail) return;

    if (this.houseDetail.houseVideo) {
      this.mediaItems.push({
        type: 'video',
        path: this.houseDetail.houseVideo
      });
    }

    if (this.houseDetail?.houseImages?.length) {
      this.mediaItems.push(
        ...this.houseDetail.houseImages
          .filter(image => image.path)
          .map(image => ({
            type: "image" as const,
            path: image.path as string
          }))
      );
    }
    this.currentSlideIndex = 0;
  }
}
