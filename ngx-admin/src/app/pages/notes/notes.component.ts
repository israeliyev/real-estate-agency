import {ChangeDetectorRef, Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {HouseDto} from "../../model/HouseDto";
import {HouseService} from "../../@core/utils/house.service";
import {PriceType} from "../../@core/utils/enums/PriceType";
import {HttpStatusCode} from "@angular/common/http";
import {MainCategoryDto} from "../../model/MainCategoryDto";
import {SubCategoryDto} from "../../model/SubCategoryDto";
import {GetFilterHousesRequest} from "../../model/GetFilterHousesRequest";
import {debounceTime} from "rxjs/operators";
import {ParameterDto} from "../../model/ParameterDto";
import {Subject} from "rxjs";
import {OrderEnum} from "../../model/OrderEnum";
import {NbToastrService} from "@nebular/theme";
import {CategoryService} from "../../@core/utils/category.service";
import {Router} from "@angular/router";

@Component({
  selector: 'ngx-notes',
  templateUrl: './notes.component.html',
  styleUrls: ['./notes.component.scss'],
})
export class NotesComponent implements OnInit {
  houses: HouseDto[] = [];
  editingHouseId: number | null = null;
  editedHouse: HouseDto | null = null;
  priceType = PriceType; // For template access to enum

  mainCategories: MainCategoryDto[] = [];
  subCategories: SubCategoryDto[] = [];
  parameters: ParameterDto[] = [];

  selectedMainCategory?: MainCategoryDto;
  selectedSubCategory?: SubCategoryDto;
  priceParameter?: ParameterDto | null;
  locationParameter?: ParameterDto | null;

  orderType = OrderEnum.LAST;
  pageNumber = 1; // Current page
  pageSize = 10;  // Records per page
  totalElements = 0; // Total number of houses
  totalPages = 0; // Total number of pages

  // Use Maps for better parameter management
  selectiveParameterValues = new Map<number, { valueId: number; valueName: string }>();
  inputParameterRanges = new Map<number, { min: number; max: number }>();

  searchKey: string | undefined;

  public filterSubject = new Subject<void>();
  loading: boolean | undefined = true;
  @ViewChild('scrollContainer', { static: false }) scrollContainer: ElementRef;

  constructor(private houseService: HouseService,
              private toaster: NbToastrService,
              private categoryService: CategoryService,
              private router: Router,
              private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.setupFilterDebounce();
    this.loadInitialData();
    this.fetchFilteredHouses();
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

  startEdit(house: HouseDto): void {
    this.editingHouseId = house.id ?? null;
    this.editedHouse = { ...house };
  }

  saveEdit(): void {
    if (this.editedHouse && this.editingHouseId) {
      this.houseService.updateHouse(this.editedHouse).subscribe({
        next: () => {
          const index = this.houses.findIndex(h => h.id === this.editingHouseId);
          if (index !== -1) {
            this.houses[index] = { ...this.editedHouse};
          }
          this.cancelEdit();
        },
        error: (err) => {
          this.toaster.danger('Yeniləmə uğursuz oldu'); // "Update failed"
        },
      });
    }
  }

  cancelEdit(): void {
    this.editingHouseId = null;
    this.editedHouse = null;
  }

  getParameterDisplay(house: HouseDto): string {
    const selectiveParams = house.selectiveParameters?.map(sp => `${sp.parameter.name}: ${sp.name}`) || [];
    const inputParams = house.inputParameters?.map(ip => `${ip.parameter.name}: ${ip.value}`) || [];
    return [...selectiveParams, ...inputParams].join(', ');
  }

  getCategories(): void {
    this.categoryService.getCategories().subscribe({
      next: (result) => {
        if (result.responseStatus === HttpStatusCode.Ok && result.data) {
          this.mainCategories = result.data;
          this.getParametersBySubCategoryId(0);
        } else {
          this.mainCategories = [];
          this.toaster.danger('Kateqoriyalar yüklənərkən xəta baş verdi', 'Xəta');
        }
      },
      error: (err) => {
        console.error('Error fetching categories:', err);
        this.toaster.danger('Kateqoriyalar yüklənərkən xəta baş verdi', 'Xəta');
      },
    });
  }

  getStandardSubCategories() {
    this.categoryService.getSubCategoriesWithoutMainCategory().subscribe({
      next: (response) => {
        if (response.responseStatus === HttpStatusCode.Ok) {
          if (response.data) {
            this.subCategories = [...this.subCategories, ...response.data];
          }
        } else {
          console.error('Failed to fetch subcategories');
        }
      },
      error: (err) => {
        console.error('Failed to fetch subcategories:', err);
      },
    });
  }

  openHouseDetail(houseId: number): void {
    this.router.navigate(['/pages/house', houseId]);
  }

  searchProducts(event: Event) {
    const input = event.target as HTMLInputElement;
    this.pageNumber = 1;
    this.searchKey = input.value;
    this.filterSubject.next();
  }

  selectMainCategory(mainCategory?: MainCategoryDto): void {
    this.pageNumber = 1;
    if (!mainCategory) return;
    this.subCategories = mainCategory.subCategories || [];
    this.selectedMainCategory = mainCategory;
    this.getStandardSubCategories();
    this.fetchFilteredHouses();
  }

  selectSubCategory(subCategory?: SubCategoryDto): void {
    this.pageNumber = 1;
    if (!subCategory) return;
    this.selectedSubCategory = subCategory;
    this.getParametersBySubCategoryId(subCategory.id);
    this.fetchFilteredHouses();
  }

  getParametersBySubCategoryId(subCategoryId: number): void {
    this.categoryService.getParametersBySubCategoryId(subCategoryId).subscribe({
      next: (result) => {
        if (result.responseStatus === HttpStatusCode.Ok && result.data) {
          const data = result.data;
          this.parameters = data.filter((param) => !['LOCATION', 'PRICE'].includes(param.code));
          this.priceParameter = data.find((param) => param.code === 'PRICE') || null;
          this.locationParameter = data.find((param) => param.code === 'LOCATION') || null;
        } else {
          this.toaster.danger('Parametrlər Yüklənən zaman xəta baş verdi', 'Xəta');
        }
      },
      error: (err) => {
        console.error('Error fetching parameters:', err);
        this.toaster.danger('Parametrlər Yüklənən zaman xəta baş verdi', 'Xəta');
      },
    });
  }

  fetchFilteredHouses(): void {
    this.loading = true;
    const request: GetFilterHousesRequest = {
      sort: this.orderType,
      searchKey: this.searchKey,
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

    this.houseService.getHousesWithDetailsByfilter(request).subscribe({
      next: (response) => {
        if (response.responseStatus === HttpStatusCode.Ok && response.data) {
          this.houses = response.data;
          this.totalElements = response.totalElements || 0;
          this.totalPages = response.totalPages || Math.ceil(this.totalElements / this.pageSize);
          this.pageNumber = response.pageNumber || this.pageNumber;
          this.loading = false;
          setTimeout(() => {
            const scrollTarget = this.scrollContainer ? this.scrollContainer.nativeElement : window;
            try {
              scrollTarget.scrollTo({ top: 0, behavior: 'smooth' });
            } catch (e) {
              scrollTarget.scrollTo(0, 0); // Fallback
            }
          }, 0);

          this.cdr.detectChanges();

        } else {
          this.toaster.danger('Evlər tapılmadı', 'Xəta');
          this.houses = [];
          this.totalElements = 0;
          this.totalPages = 0;
          this.loading = false;
        }
      },
      error: (err) => {
        this.toaster.danger('Evlər yüklənərkən xəta baş verdi', 'Xəta');
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

    // Handle edge cases
    if (totalPages <= 1) {
      return totalPages === 1 ? [1] : [];
    }

    // If total pages are few and on desktop, show all pages
    if (totalPages <= maxVisiblePages) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    const pages: (number | string)[] = [];

    // Always include the first page
    pages.push(1);

    // Calculate the range of pages to show around the current page
    let start: number;
    let end: number;

    // Determine the range to avoid duplicates and invalid pages
    const halfVisible = Math.floor(maxVisiblePages / 2);
    start = Math.max(2, currentPage - halfVisible);
    end = Math.min(totalPages - 1, currentPage + halfVisible);

    // Adjust start and end to ensure we show maxVisiblePages (excluding first/last)
    if (end - start + 1 < maxVisiblePages - 2) {
      if (currentPage <= halfVisible + 1) {
        end = Math.min(totalPages - 1, maxVisiblePages - 1);
      } else {
        start = Math.max(2, totalPages - maxVisiblePages + 2);
      }
    }

    // Add ellipsis before if needed
    if (start > 2) {
      pages.push('...');
    }

    // Add the range of pages
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    // Add ellipsis after if needed
    if (end < totalPages - 1) {
      pages.push('...');
    }

    // Always include the last page
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
    this.selectiveParameterValues.clear();
    this.inputParameterRanges.clear();
    this.selectedMainCategory = undefined; // Fix: Use undefined instead of {}
    this.selectedSubCategory = undefined; // Fix: Use undefined instead of {}
    this.orderType = OrderEnum.LAST;
    this.getParametersBySubCategoryId(0);
    this.fetchFilteredHouses();
  }

  private setupFilterDebounce(): void {
    this.filterSubject
      .pipe(debounceTime(300))
      .subscribe(() => this.fetchFilteredHouses());
  }

  private loadInitialData(): void {
    this.getCategories();
  }

  getPriceTypeLabel(priceType?: PriceType): string {
    switch (priceType) {
      case PriceType.MONTH: return 'Aylıq';
      case PriceType.SALE: return 'Satış';
      case PriceType.MORTGAGE: return 'İpoteka';
      case PriceType.DAY: return 'Günlük';
      default: return '-';
    }
  }

  protected readonly OrderEnum = OrderEnum;
}
