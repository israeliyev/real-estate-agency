import {Component, OnInit} from '@angular/core';
import {CategoryService} from "../service/CategoryService";
import {HttpStatusCode} from "../util/HttpStatusCode";
import {MainCategoryDto} from "../models/MainCategoryDto";
import {SubCategoryDto} from "../models/SubCategoryDto";
import {HouseService} from "../service/HouseService";
import {SectionDto} from "../models/SectionDto";
import {ParameterDto} from "../models/ParameterDto";
import {ParameterTypeEnum} from "../util/ParameterTypeEnum";
import {ImageService} from "../service/image-service.service";
import {PriceType} from "../util/PriceType";
import {Router} from "@angular/router";
import {ToastrService} from "ngx-toastr";
import {AnalyticsService} from "../service/analytics.service";
import {HouseRequestDto} from "../models/HouseRequestDto";
import {forkJoin} from "rxjs";

interface Slide {
  image: string;
  title: string;
  description: string;
}

@Component({
  selector: 'app-home-page',
  templateUrl: './home-page.component.html',
  styleUrls: ['./home-page.component.css']
})
export class HomePageComponent implements OnInit {

  mainCategories: MainCategoryDto[] = [];
  selectedMainCategory?: MainCategoryDto;
  selectedSubCategories: SubCategoryDto[] = [];
  sections?: SectionDto[];


  selectedMainCategoryForRequest?: MainCategoryDto;
  selectedSubCategoryForRequest?: SubCategoryDto;
  subCategoriesForHouseRequest: SubCategoryDto[] = [];
  parameters: ParameterDto[] = [];
  priceParameter?: ParameterDto | null;
  locationParameter?: ParameterDto | null;

  requester?: string;
  phone?: string;
  price?: number;
  priceType?: PriceType;
  location?: string;

  selectiveParameterValues = new Map<number, number>();
  inputParameterValues = new Map<number, number>();

  images: { file: File | null; url: string; uploading: boolean }[] = Array(4).fill(null).map(() => ({
    file: null,
    url: '',
    uploading: false
  }));


  isSubmitted = false;
  timeLeft = 0;

  readonly ParameterTypeEnum = ParameterTypeEnum;
  readonly PriceType = PriceType;
  slides: Slide[] = [
    {image: "../assets/img/008.jpg", title: 'First Slide', description: 'Description for the first slide.'},
    {image: "../assets/img/205.jpg", title: 'Second Slide', description: 'Description for the second slide.'},
    {image: "../assets/img/206.jpg", title: 'Third Slide', description: 'Description for the third slide.'}
  ];
  currentSlide = 0;

  loadingCategories = false;
  loadingSections = false;
  loadingParameters = false;

  private interval?: any;

  constructor(
    private categoryService: CategoryService,
    private router: Router,
    private houseService: HouseService,
    private toaster: ToastrService,
    private imageService: ImageService,
    private analyticsService: AnalyticsService
  ) {
  }

  ngOnInit() {
    this.autoSlide();
    this.getCategories();
    this.getSections();
    this.checkTimerStatus();
    this.analyticsService.trackSiteVisit(this.getSessionId()).subscribe();

    const storedFiles = this.imageService.getStoredFiles();
    if (storedFiles.length > 0) {
      localStorage.removeItem('uploadedFiles');
      const deleteRequests = storedFiles.map(url => this.imageService.deleteFile(url));
      forkJoin(deleteRequests).subscribe({
        next: () => {
          this.toaster.info('Əvvəlki şəkillər silindi', 'Xəbərdarlıq');
        },
        error: (err) => {
          console.error('Delete error:', err);
          this.toaster.error('Şəkilləri silmək alınmadı', 'Xəta');
        }
      });
    }
  }


  getCategories() {
    this.loadingCategories = true;
    this.categoryService.getCategories().subscribe({
      next: (result) => {
        if (result.responseStatus === HttpStatusCode.OK) {
          this.mainCategories = result.data ?? [];
          if (this.mainCategories.length > 0) {
            this.selectMainCategory(this.mainCategories[0])
            this.getParametersBySubCategoryId(0);
          }
        } else {
          console.error('Kateqoriyalar yüklənmədi', 'Xəta');
        }
        this.loadingCategories = false;
      },
      error: (err) => {
        console.error(err, 'Xəta');
        this.loadingCategories = false;
      }
    });
  }

  getSections() {
    this.loadingSections = true;
    this.houseService.getHousesBySectionPage('HOMEPAGE').subscribe({
      next: (result) => {
        if (result.responseStatus === HttpStatusCode.OK) {
          this.sections = (result.data ?? []).filter(sc => sc.houses.length > 0);
          this.loadingSections = false;
        } else {
          this.sections = [];
          console.error('error when fetch sections');
        }
      },
      error: (err) => {
        this.sections = [];
        this.loadingSections = false;
        console.error(err);
      }
    });
  }


  getStandardSubCategories(place: string) {
    this.categoryService.getSubCategoriesWithoutMainCategory().subscribe({
      next: (response) => {
        if (response.responseStatus === HttpStatusCode.OK) {
          if (response.data) {
            if (place === 'menu') {
              this.selectedSubCategories = [...this.selectedSubCategories, ...response.data];
            }
            if (place === 'form') {
              this.subCategoriesForHouseRequest = [...this.subCategoriesForHouseRequest, ...response.data];
            }
          }
        } else {
          console.error('Failed to fetch subcategories');
        }
      },
      error: (err) => {
        console.error('Failed to fetch subcategories:', err);
      }
    });
  }

  selectMainCategory(category: MainCategoryDto) {
    this.selectedMainCategory = category;
    this.selectedSubCategories = category.subCategories ?? [];
    this.getStandardSubCategories('menu');
  }

  selectMainCategoryForRequest(mainCategory?: MainCategoryDto) {
    this.parameters = [];
    this.selectedSubCategoryForRequest = undefined;
    this.selectiveParameterValues.clear();
    this.inputParameterValues.clear();

    this.selectedMainCategoryForRequest = mainCategory;
    this.subCategoriesForHouseRequest = mainCategory?.subCategories ?? [];
    this.getStandardSubCategories('form');
  }

  selectSubCategoryForRequest(sub?: SubCategoryDto) {
    this.parameters = [];
    this.selectiveParameterValues.clear();
    this.inputParameterValues.clear();

    this.selectedSubCategoryForRequest = sub;
    this.getParametersBySubCategoryId(sub?.id || 0);
  }

  getParametersBySubCategoryId(subCategoryId: number) {
    this.loadingParameters = true;
    this.categoryService.getParametersBySubCategoryId(subCategoryId).subscribe({
      next: (result) => {
        this.handleParametersSuccess(result);
        this.loadingParameters = false;
      },
      error: () => {
        this.handleParametersError();
        this.loadingParameters = false;
      }
    });
  }


  onSelectChangeParameter(parameterId: number, event: Event) {
    const value = Number((event.target as HTMLInputElement).value) || 0;
    if (value <= 0) {
      this.selectiveParameterValues.delete(parameterId);
    } else {
      this.selectiveParameterValues.set(parameterId, value);
    }
  }

  onLocationSelectChangeParameter(parameterId: number, event: Event) {
    const value = Number((event.target as HTMLInputElement).value) || 0;
    if (value <= 0) {
      this.selectiveParameterValues.delete(parameterId);
      this.location = undefined;
    } else {
      this.selectiveParameterValues.set(parameterId, value);
      this.location = this.locationParameter?.selectiveParameterValues?.find(
        sp => sp.id === value
      )?.name ?? undefined;
    }
  }

  onSelectPriceType(event: Event) {
    const selectedValue = (event.target as HTMLSelectElement).value;
    this.priceType = selectedValue as PriceType;
  }

  onInputChangeParameter(parameterId: number, event: Event) {
    const value = Number((event.target as HTMLInputElement).value) || 0;
    if (value <= 0) {
      this.inputParameterValues.delete(parameterId);
    } else {
      this.inputParameterValues.set(parameterId, value);
    }
  }

  onFileChange(event: Event, index: number): void {
    const input = event.target as HTMLInputElement;
    const file = input?.files?.[0];
    if (!file) return;

    this.images[index].uploading = true;

    this.imageService.processAndUploadFile(file).subscribe({
      next: (url) => {
        this.images[index] = {file, url, uploading: false};
        this.toaster.success('Şəkil yükləndi', 'Uğur');
      },
      error: (err: any) => {
        this.images[index] = {file: null, url: '', uploading: false};
        const errorMessage = typeof err === 'string' ? err : err.message || 'Bilinməyən xəta';
        this.toaster.error(errorMessage, 'Xəta');
      },
      complete: () => {
        input.value = '';
      }
    });
  }

  deleteImage(index: number): void {
    const imageUrl = this.images[index].url;
    if (!imageUrl) return;

    this.imageService.deleteFile(imageUrl).subscribe({
      next: () => {
        this.images[index] = {file: null, url: '', uploading: false};
        this.toaster.success('Şəkil silindi', 'Uğur');
      },
      error: (err: string) => {
        this.toaster.error(err, 'Xəta');
        console.error('Delete error:', err);
      }
    });
  }


  submit() {
    const request = this.prepareRequest();

    if (!request.requester) {
      this.toaster.error("Adınızı qeyd edin", "Form xətası");
      return;
    } else if (!request.number) {
      this.toaster.error("Telefon nömrənizi qeyd edin", "Form xətası");
      return;
    } else if (!request.mainCategory.id) {
      this.toaster.error("Kateqoriya seçin", "Form xətası");
      return;
    } else if (request.requester.length > 100) {
      this.toaster.error("Adınız çox uzundur", "Form xətası");
      return;
    } else if (!request.price || request.price <= 0) {
      this.toaster.error("Qiymət qeyd edin", "Form xətası");
      return;
    } else if (!request.location) {
      this.toaster.error("Məkan seçin", "Form xətası");
      return;
    }

    this.houseService.createHouseRequest(request).subscribe({
      next: (response) => {
        if (response.responseStatus === HttpStatusCode.OK) {
          this.isSubmitted = true;
          this.toaster.success('Ev istəyi qeydə alındı', 'İstək uğurludu');
          this.startCountdown();
          this.resetForm();
          localStorage.removeItem('uploadedFiles');
        } else {
          this.toaster.error('Ev istəyi qeydə alınmadı', 'Xəta');
        }
      },
      error: () => {
        this.toaster.error('Xəta baş verdi', 'Xəta');
        this.toaster.error('Ev istəyi qeydə alınmadı', 'Xəta');
      }
    });
  }

  checkTimerStatus() {
    const startDate = localStorage.getItem('startDate');
    if (startDate) {
      const timePassed = Math.floor((Date.now() - Number(startDate)) / 1000);


      this.timeLeft = Math.max(60 - timePassed, 0);

      if (this.timeLeft > 0) {
        this.startCountdown();
      } else {
        localStorage.removeItem('startDate');
      }
    }
  }

  startCountdown() {

    if (!localStorage.getItem('startDate')) {
      localStorage.setItem('startDate', Date.now().toString());

      this.timeLeft = 60;
    }


    if (this.interval) {
      clearInterval(this.interval);
    }

    this.interval = setInterval(() => {
      if (this.timeLeft > 0) {
        this.timeLeft--;
      } else {
        clearInterval(this.interval);
        localStorage.removeItem('startDate');
      }
    }, 1000);
  }


  getHouses(subCategoryId: number) {
    this.router.navigate(["/evler"], {
      queryParams: {mainCategoryId: this.selectedMainCategory?.id, subCategoryId}
    });
  }

  autoSlide() {
    setInterval(() => this.nextSlide(), 5000);
  }

  nextSlide() {
    this.currentSlide = (this.currentSlide + 1) % this.slides.length;
  }


  private prepareRequest(): HouseRequestDto {
    const imageUrls = this.images.map(img => img.url).filter(url => url);
    return {
      id: 0,
      requester: this.requester?.trim() || '',   // Fix: ?.trim()
      price: this.price || 0,
      priceType: this.priceType || PriceType.MONTH,
      location: this.location || '',
      number: this.phone,
      createDate: new Date(),
      coverImage: imageUrls.length > 0 ? imageUrls[0] : '',
      mainCategory: {
        id: this.selectedMainCategoryForRequest?.id || 0,    // Fix: ?.
        name: this.selectedMainCategoryForRequest?.name || ''
      },
      subCategory: {
        id: this.selectedSubCategoryForRequest?.id || 0,     // Fix: ?.
        name: this.selectedSubCategoryForRequest?.name || ''
      },
      houseImages: imageUrls.map(url => ({
        id: null,
        path: url,
        fileName: url.split('/').pop() || null,
        createDate: new Date(),
        updateDate: null,
        house: null
      })),
      selectiveParameters: Array.from(this.selectiveParameterValues.entries()).map(([parameterId, value]) => {
        const param = this.parameters.find(p => p.id === parameterId);
        // Fix: guard param and selectiveValue with ?.
        const selectiveValue = param?.selectiveParameterValues?.find(sp => sp.id === value);
        return {
          id: value,
          name: selectiveValue?.name || '',
          createDate: new Date(),
          updateDate: new Date(),
          parameter: undefined
        };
      }),
      inputParameters: Array.from(this.inputParameterValues.entries()).map(([parameterId, value]) => {
        const param = this.parameters.find(p => p.id === parameterId);
        return {
          code: param?.code || '',
          value: value,
          parameter: {id: parameterId}
        };
      })
    };
  }

  private resetForm() {
    this.requester = undefined;
    this.phone = undefined;
    this.price = undefined;
    this.priceType = undefined;
    this.location = undefined;
    this.selectedMainCategoryForRequest = undefined;
    this.selectedSubCategoryForRequest = undefined;
    this.subCategoriesForHouseRequest = [];
    this.parameters = [];
    this.priceParameter = null;
    this.locationParameter = null;
    this.selectiveParameterValues.clear();
    this.inputParameterValues.clear();
    this.images = Array(4).fill(null).map(() => ({file: null, url: '', uploading: false}));
  }

  private handleParametersSuccess(result: any) {
    if (result.responseStatus !== HttpStatusCode.OK) return this.handleParametersError();
    const data = result.data ?? [];
    this.parameters = data.filter((param: ParameterDto) => !['LOCATION', 'PRICE'].includes(<string>param.code));
    this.priceParameter = data.find((param: ParameterDto) => param.code === 'PRICE') || null;
    this.locationParameter = data.find((param: ParameterDto) => param.code === 'LOCATION') || null;
  }

  private handleParametersError() {
    this.parameters = [];
    this.priceParameter = null;
    this.locationParameter = null;
    console.error('Parametrlər yüklənmədi', 'Xəta');
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
