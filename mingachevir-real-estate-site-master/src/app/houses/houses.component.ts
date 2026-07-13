import {Component, OnInit} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {Subject} from 'rxjs';
import {debounceTime, tap} from 'rxjs/operators';
import {HouseService} from '../service/HouseService';
import {CategoryService} from '../service/CategoryService';
import {HttpStatusCode} from '../util/HttpStatusCode';
import {OrderEnum} from '../util/OrderEnum';
import {SectionDto} from '../models/SectionDto';
import {MainCategoryDto} from '../models/MainCategoryDto';
import {SubCategoryDto} from '../models/SubCategoryDto';
import {ParameterDto} from '../models/ParameterDto';
import {HouseCardDto} from '../models/HouseCardDto';
import {GetFilterHousesRequest} from '../models/request/GetFilterHousesRequest';
import {AnalyticsService} from "../service/analytics.service";
import {ParameterTypeEnum} from "../util/ParameterTypeEnum";

@Component({
  selector: 'app-houses',
  templateUrl: './houses.component.html',
  styleUrls: ['./houses.component.css'],
})
export class HousesComponent implements OnInit {

  paramMainCategoryId: number | undefined | null;
  paramSubCategoryId: number | undefined | null;

  houses: HouseCardDto[] = [];
  mainCategories: MainCategoryDto[] = [];
  subCategories: SubCategoryDto[] = [];
  sections: SectionDto[] = [];
  parameters: ParameterDto[] = [];

  selectedMainCategory?: MainCategoryDto;
  selectedSubCategory?: SubCategoryDto;
  priceParameter?: ParameterDto | null;
  locationParameter?: ParameterDto | null;

  searchKey = '';
  orderType = OrderEnum.LAST;
  pageNumber = 1;
  pageSize = 20;
  totalElements = 0;
  totalPages = 0;


  selectiveParameterValues = new Map<number, { valueId: number; valueName: string }>();
  inputParameterRanges = new Map<number, { min: number; max: number }>();

  readonly OrderEnum = OrderEnum;

  public filterSubject = new Subject<void>();
  loading: boolean | undefined = true;
  public readonly ParameterTypeEnum = ParameterTypeEnum;

  constructor(
    private route: ActivatedRoute,
    private houseService: HouseService,
    private categoryService: CategoryService,
    private analyticsService: AnalyticsService
  ) {
  }

  get sortName(): string {
    const names: Record<OrderEnum, string> = {
      [OrderEnum.LAST]: 'Ən son',
      [OrderEnum.OLD]: 'Ən əvvəl',
      [OrderEnum.EXPENSIVE]: 'Əvvəlcə bahalı',
      [OrderEnum.CHEAP]: 'Əvvəlcə ucuz',
    };
    return names[this.orderType] || 'Ən son';
  }

  ngOnInit(): void {
    this.setupFilterDebounce();
    this.initializeFromQueryParams();
  }

  getSections(): void {
    this.houseService.getHousesBySectionPage('HOUSES').subscribe({
      next: (result) => {
        if (result.responseStatus === HttpStatusCode.OK) {
          this.sections = (result.data ?? []).filter(sc => sc.houses.length > 0);
        } else {
          console.error('error when fetch sections');
        }
      },
      error: (err) => {
        this.sections = [];
        console.error(err);
      }
    });
  }


  getCategories(): void {
    this.categoryService.getCategories().subscribe({
      next: (result) => {
        if (result.responseStatus === HttpStatusCode.OK && result.data) {
          this.mainCategories = result.data;
          if (this.paramMainCategoryId && this.paramSubCategoryId && this.mainCategories.find(ct => ct.id === this.paramMainCategoryId)) {
            this.selectMainCategory(this.mainCategories.find(ct => ct.id === this.paramMainCategoryId));
          } else {
            this.selectMainCategory(this.mainCategories[0]);
          }
        } else {
          this.mainCategories = [];
          console.error('Error fetching categories:')
        }
      },
      error: (err) => console.error('Error fetching categories:', err),
    });
  }

  getStandardSubCategories() {
    return this.categoryService.getSubCategoriesWithoutMainCategory().pipe(
      tap({
        next: (response) => {
          if (response.responseStatus === HttpStatusCode.OK && response.data) {
            this.subCategories = [...(this.subCategories || []), ...response.data];
          } else {
            console.error('Failed to fetch standard subcategories');
          }
        },
        error: (err) => {
          console.error('Failed to fetch standard subcategories:', err);
        }
      })
    );
  }

  selectMainCategory(mainCategory?: MainCategoryDto): void {
    this.pageNumber = 1;
    if (!mainCategory) return;

    this.selectedMainCategory = mainCategory;
    this.subCategories = mainCategory.subCategories || [];

    this.getStandardSubCategories().subscribe(() => {
      if (this.paramMainCategoryId && this.paramSubCategoryId) {
        const subCategory = this.subCategories.find(st => st.id === this.paramSubCategoryId);
        if (subCategory) {
          this.selectSubCategory(subCategory);
        } else {
          this.getParametersBySubCategoryId(0);
          this.fetchFilteredHouses();
        }
        this.paramMainCategoryId = null;
        this.paramSubCategoryId = null;
      } else {
        this.getParametersBySubCategoryId(0);
        this.fetchFilteredHouses();
      }
    });

    if (this.searchKey) {
      this.resetFiltersWhenSearch();
    }
  }

  selectSubCategory(subCategory?: SubCategoryDto): void {
    this.pageNumber = 1;
    if (!subCategory) return;
    this.selectedSubCategory = subCategory;
    this.getParametersBySubCategoryId(subCategory.id);
    this.fetchFilteredHouses();
    this.paramMainCategoryId = null;
    this.paramSubCategoryId = null;
  }

  getParametersBySubCategoryId(subCategoryId: number): void {
    this.categoryService.getParametersBySubCategoryId(subCategoryId).subscribe({
      next: (result) => {
        if (result.responseStatus === HttpStatusCode.OK && result.data) {
          const data = result.data;
          this.parameters = data.filter((param) => !['LOCATION', 'PRICE'].includes(<string>param.code));
          this.priceParameter = data.find((param) => param.code === 'PRICE') || null;
          this.locationParameter = data.find((param) => param.code === 'LOCATION') || null;
        } else {
          console.error('Error fetching parameters:');
        }
      },
      error: (err) => console.error('Error fetching parameters:', err),
    });
  }

  fetchFilteredHouses(): void {
    this.loading = true;
    const request: GetFilterHousesRequest = {
      sort: this.orderType,
      searchKey: this.searchKey || undefined,
      mainCategoryId: this.selectedMainCategory?.id,
      subCategoryId: this.selectedSubCategory?.id,
      selectiveParameterIds: Array.from(this.selectiveParameterValues.values()).map((v) => v.valueId),
      inputParametersRanges: Array.from(this.inputParameterRanges.entries()).map(([parameterId, range]) => ({
        parameterId,
        min: range.min,
        max: range.max,
      })),
      pageNumber: this.pageNumber,
    };

    this.houseService.getHousesByfilter(request).subscribe({
      next: (response) => {
        if (response.responseStatus === HttpStatusCode.OK && response.data) {
          this.houses = response.data;
          this.totalElements = response.totalElements || 0;
          this.totalPages = response.totalPages || Math.ceil(this.totalElements / this.pageSize);
          this.pageNumber = response.pageNumber || this.pageNumber;
          this.loading = false;
        } else {
          this.houses = [];
          this.totalElements = 0;
          this.totalPages = 0;
          this.loading = false;
          console.error("get error when fetch houses by filter")
        }

        const sessionId = this.getSessionId();
        this.analyticsService.trackSearchQuery(request, sessionId).subscribe();
      },
      error: (err) => {
        console.error('Error fetching houses:', err);
        this.houses = [];
        this.totalElements = 0;
        this.totalPages = 0;
        this.loading = false;
      },
    });
  }


  changePage(page: number): void {
    if (page < 1 || page > this.totalPages) return;
    this.pageNumber = page;
    this.fetchFilteredHouses();
    window.scrollTo({top: 0, behavior: 'smooth'});
  }

  getPageRange(): (number | string)[] {
    const maxVisiblePages = window.innerWidth > 768 ? 5 : 3;
    const totalPages = this.totalPages;
    const currentPage = this.pageNumber;


    if (totalPages <= 1) {
      return totalPages === 1 ? [1] : [];
    }


    if (totalPages <= maxVisiblePages) {
      return Array.from({length: totalPages}, (_, i) => i + 1);
    }

    const pages: (number | string)[] = [];


    pages.push(1);


    let start: number;
    let end: number;


    const halfVisible = Math.floor(maxVisiblePages / 2);
    start = Math.max(2, currentPage - halfVisible);
    end = Math.min(totalPages - 1, currentPage + halfVisible);


    if (end - start + 1 < maxVisiblePages - 2) {
      if (currentPage <= halfVisible + 1) {
        end = Math.min(totalPages - 1, maxVisiblePages - 1);
      } else {
        start = Math.max(2, totalPages - maxVisiblePages + 2);
      }
    }


    if (start > 2) {
      pages.push('...');
    }


    for (let i = start; i <= end; i++) {
      pages.push(i);
    }


    if (end < totalPages - 1) {
      pages.push('...');
    }


    if (totalPages > 1) {
      pages.push(totalPages);
    }

    return pages;
  }

  trackByFn(index: number, item: number | string): number | string {
    return item;
  }

  onPageClick(page: number | string): void {
    if (typeof page === 'number') {
      this.changePage(page);
    }
  }

  onMinChange(parameterId: number, event: Event): void {
    this.pageNumber = 1;
    const value = Number((event.target as HTMLInputElement).value) || 0;
    const range = this.inputParameterRanges.get(parameterId) || {min: 0, max: 0};
    this.inputParameterRanges.set(parameterId, {...range, min: value});
    this.filterSubject.next();
  }

  onMaxChange(parameterId: number, event: Event): void {
    this.pageNumber = 1;
    const value = Number((event.target as HTMLInputElement).value) || 0;
    const range = this.inputParameterRanges.get(parameterId) || {min: 0, max: 0};
    this.inputParameterRanges.set(parameterId, {...range, max: value});
    this.filterSubject.next();
  }

  onSelectParameterChange(parameterId: number, valueId: number, valueName: string): void {
    this.pageNumber = 1;
    this.selectiveParameterValues.set(parameterId, {valueId, valueName});
    this.fetchFilteredHouses();
  }

  setOrderType(orderType: OrderEnum): void {
    this.pageNumber = 1;
    this.orderType = orderType;
    this.fetchFilteredHouses();
  }

  resetFilters(): void {
    this.pageNumber = 1;
    this.searchKey = '';
    this.selectiveParameterValues.clear();
    this.inputParameterRanges.clear();
    this.selectedMainCategory = undefined;
    this.selectedSubCategory = undefined;
    this.orderType = OrderEnum.LAST;
    this.getParametersBySubCategoryId(0);
    this.fetchFilteredHouses();
  }

  resetFiltersWhenSearch(): void {
    this.pageNumber = 1;
    this.selectiveParameterValues.clear();
    this.inputParameterRanges.clear();
    this.selectedMainCategory = undefined;
    this.selectedSubCategory = undefined;
    this.orderType = OrderEnum.LAST;
    this.getParametersBySubCategoryId(0);
    this.fetchFilteredHouses();
    this.searchKey = '';
  }

  private setupFilterDebounce(): void {
    this.filterSubject
      .pipe(debounceTime(300))
      .subscribe(() => this.fetchFilteredHouses());
  }

  private initializeFromQueryParams(): void {
    this.pageNumber = 1;
    this.route.queryParams.subscribe((params) => {
      this.searchKey = params['searchKey'] || '';
      this.paramMainCategoryId = Number(params['mainCategoryId']);
      this.paramSubCategoryId = Number(params['subCategoryId']);
      this.loadInitialData();
    });
  }

  private getSessionId(): string {
    let sessionId = localStorage.getItem('sessionId');
    if (!sessionId) {
      sessionId = 'session-' + Math.random().toString(36).substr(2, 9);
      localStorage.setItem('sessionId', sessionId);
    }
    return sessionId;
  }

  private loadInitialData(): void {
    this.getSections();
    this.getCategories();
  }
}
