import {ChangeDetectorRef, Component, HostListener, OnDestroy, OnInit} from '@angular/core';
import {CreateInputParameterValueRequest} from '../../model/CreateInputParameterValueRequest';
import {ParameterDto} from '../../model/ParameterDto';
import {MainCategoryDto} from '../../model/MainCategoryDto';
import {SubCategoryDto} from '../../model/SubCategoryDto';
import {ActivatedRoute, Router} from '@angular/router';
import {HouseService} from '../../@core/utils/house.service';
import {CategoryService} from '../../@core/utils/category.service';
import {FileService} from '../../@core/utils/file-service.service';
import {NbToastrService} from '@nebular/theme';
import {HttpStatusCode} from '../../model/HttpStatusCode';
import {GenericResponse} from '../../model/base/GenericResponse';
import {PriceType} from '../../@core/utils/enums/PriceType';
import {HouseDto} from '../../model/HouseDto';
import {HouseImageDto} from '../../model/HouseImageDto';
import {BaseActiveDto} from '../../model/base/BaseActiveDto';
import {ParameterTypeEnum} from '../../@core/utils/enums/ParameterTypeEnum';
import {forkJoin} from 'rxjs';

@Component({
  selector: 'ngx-house-detail',
  templateUrl: './house-detail.component.html',
  styleUrls: ['./house-detail.component.scss'],
})
export class HouseDetailComponent {
  // Constants and Enums
  protected readonly PriceTypeEnum = PriceType;
  private readonly maxPhotos = 10;
  private readonly maxVideo = 1;
  private readonly maxPhotoFileSize = 5 * 1024 * 1024; // 5MB limit
  private readonly maxVideoFileSize = 100 * 1024 * 1024; // 100MB limit
  private warningIdCounter = 0;

  // House Data
  originalHouse: HouseDto;
  house: HouseDto;
  houseId?: number;

  // Categories and Parameters
  mainCategories: MainCategoryDto[] = [];
  subCategoriesForHouseRequest: SubCategoryDto[] = [];
  standardSubCategories: SubCategoryDto[] = [];
  parameters: ParameterDto[] = [];
  standardParameters: ParameterDto[] = [];

  // Selected Values
  selectedMainCategoryForRequest: MainCategoryDto;
  selectedSubCategoryForRequest: SubCategoryDto;
  selectedLocationId: number;

  // Special Parameters
  priceParameter: ParameterDto;
  locationParameter: ParameterDto;

  // House Properties
  price: number;
  priceType: PriceType = PriceType.MONTH;
  location: string;
  mainCategoryId: number;
  subCategoryId: number;

  // Parameter Values
  selectiveParameterValues: Map<number, CreateInputParameterValueRequest> = new Map();
  inputParameterValues: Map<number, CreateInputParameterValueRequest> = new Map();

  // UI State
  currentSlide = 0;
  isEditMode = false;
  isCreateMode = false;
  isSubmitted = false;
  warnings: { id: number; message: string; type: string }[] = [];

  loaded: boolean = false;
  deleting: boolean = false;

  uploadingFiles: Set<string> = new Set(); // Track uploading files

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private houseService: HouseService,
    private categoryService: CategoryService,
    private fileService: FileService,
    private toaster: NbToastrService,
    private cdr: ChangeDetectorRef,
  ) {
    this.checkUrlParameter();

    const storedFiles = this.fileService.getStoredFiles();
    if (storedFiles.length > 0) {
      const deleteRequests = storedFiles.map(url => this.fileService.deleteFile(url));
      forkJoin(deleteRequests).subscribe({
        next: () => {
          this.toaster.info('Əvvəlki şəkillər silindi', 'Xəbərdarlıq');
        },
        error: (err) => {
          console.error('Delete error:', err);
          this.toaster.warning('Şəkilləri silmək alınmadı', 'Xəta');
        },
      });
    }
  }

  // ==================== INITIALIZATION METHODS ====================
  private checkUrlParameter(): void {
    this.houseId = Number(this.route.snapshot.paramMap.get('houseId'));
    if (this.houseId) {
      this.loadHouseDetails(this.houseId);
    } else {
      this.getCategories();
      this.getParametersBySubCategoryId(0);
      this.isCreateMode = true;
      this.house = this.getEmptyHouse();
      this.loaded = true;
    }
  }

  private loadHouseDetails(id: number): void {
    this.houseService.getHouseById(id).subscribe({
      next: (response: GenericResponse<HouseDto>) => {
        if (response.responseStatus === 200 && response.data) {
          this.originalHouse = {...response.data};
          this.houseStatus = this.originalHouse.status;
          this.assignHouseDataToForm();
          this.checkDisabledCategories();
        } else {
          this.toaster.danger('Ev məlumatları yüklənərkən xəta baş verdi', 'Xəta');
          this.router.navigate(['/pages/houses']);
        }
      },
      error: () => {
        this.toaster.danger('Ev məlumatları yüklənərkən xəta baş verdi', 'Xəta');
        this.router.navigate(['/pages/houses']);
      },
    });
  }

  private getEmptyHouse(): HouseDto {
    return {
      id: 0,
      name: '',
      price: 0,
      priceType: PriceType.MONTH,
      description: '',
      location: '',
      coverImage: '',
      houseVideo: '',
      createDate: new Date(),
      updateDate: new Date(),
      code: '',
      status: false,
      ownerName: '',
      ownerNumber: '',
      notes: '',
      mainCategory: <BaseActiveDto>{id: 0, name: ''},
      subCategory: <BaseActiveDto>{id: 0, name: ''},
      houseImages: [],
      selectiveParameters: [],
      inputParameters: [],
    };
  }

  getStandardSubCategories() {
    this.categoryService.getSubCategoriesWithoutMainCategory().subscribe({
      next: (response) => {
        if (response.responseStatus === HttpStatusCode.OK) {
          this.standardSubCategories = response.data ?? [];

          // Update subCategoriesForHouseRequest to include standard subcategories
          this.subCategoriesForHouseRequest = [
            ...this.standardSubCategories,
            ...(this.selectedMainCategoryForRequest?.subCategories || []),
          ];

          // If in edit mode and house has a subcategory, select it
          if (this.house?.subCategory?.id && !this.isCreateMode) {
            this.selectedSubCategoryForRequest = this.subCategoriesForHouseRequest.find(
              sub => sub.id === this.house.subCategory.id,
            );
            this.subCategoryId = this.selectedSubCategoryForRequest?.id;

            // Fetch parameters for the subcategory if it exists
            if (this.subCategoryId) {
              this.getParametersBySubCategoryId(this.subCategoryId);
            }
          }

          this.loaded = true;
          this.dataLoaded = true;
          this.cdr.detectChanges();
        } else {
          this.toaster.danger('Standart alt kateqoriyaları yükləyərkən xəta baş verdi', 'Xəta');
        }
      },
      error: (err) => {
        console.error('Failed to fetch subcategories:', err);
        this.toaster.danger('Standart alt kateqoriyaları yükləyərkən xəta baş verdi', 'Xəta');
      },
    });
  }

  // ==================== CATEGORY & PARAMETER METHODS ====================
  getCategories() {
    this.categoryService.getCategories().subscribe({
      next: (result) => {
        if (result.responseStatus === HttpStatusCode.OK) {
          this.mainCategories = result.data ?? [];

          if (this.house?.mainCategory?.id) {
            this.selectedMainCategoryForRequest = this.mainCategories.find(
              cat => cat.id === this.house.mainCategory.id,
            );
            this.mainCategoryId = this.selectedMainCategoryForRequest?.id;
            this.selectedSubCategoryForRequest = this.subCategoriesForHouseRequest.find(
              sub => sub.id === this.house.subCategory.id,
            );
            this.subCategoryId = this.selectedSubCategoryForRequest?.id;
          }
          this.getStandardSubCategories();

          this.loaded = true;
          this.dataLoaded = true;
          this.cdr.detectChanges();
        } else {
          this.mainCategories = [];
          this.standardSubCategories = [];
          this.toaster.danger('Kateqoriyalar yüklənərkən xəta baş verdi', 'Xəta');
        }
      },
      error: (err) => {
        console.error('Error while fetching categories:', err);
        this.mainCategories = [];
        this.standardSubCategories = [];
        this.toaster.danger('Kateqoriyalar yüklənərkən xəta baş verdi', 'Xəta');
      },
    });
  }

  getParametersBySubCategoryId(subCategoryId: number): void {
    this.categoryService.getParametersBySubCategoryId(subCategoryId)
      .subscribe({
        next: (result: GenericResponse<ParameterDto[]>) => this.handleSuccess(result),
        error: (error: any) => this.handleError(error),
      });
  }

  private handleSuccess(result: GenericResponse<ParameterDto[]>): void {
    if (result.responseStatus !== HttpStatusCode.OK) {
      this.handleError(new Error('API responded with non-OK status: ' + result.responseStatus));
      return;
    }

    const data = result.data ?? [];
    const specificParameters = this.subCategoryId ? data
      .filter(param => !['LOCATION', 'PRICE'].includes(param.code) && param.subCategory?.id !== null)
      .map(param => ({
        ...param,
        selectiveParameterValues: param.selectiveParameterValues || [],
        inputParameterValues: param.inputParameterValues || [],
      })) : [];

    this.priceParameter = data.find(param => param.code === 'PRICE') || null;
    this.locationParameter = data.find(param => param.code === 'LOCATION') || null;

    if (!this.subCategoryId) {
      this.standardParameters = data.filter(param => param.subCategory?.id === null
        && !['LOCATION', 'PRICE'].includes(param.code));
    }
    this.parameters = [...this.standardParameters, ...specificParameters];

    if (this.selectedLocationId && this.locationParameter) {
      this.selectiveParameterValues.set(this.locationParameter.id, {
        parameterId: this.locationParameter.id,
        value: this.selectedLocationId,
      });
    }
  }

  private handleError(error: any): void {
    this.parameters = [];
    this.priceParameter = null;
    this.locationParameter = null;
    this.toaster.danger(`Parametirlər alınmadı`, 'Xəta');
  }

  // ==================== SELECTION HANDLERS ====================
  selectMainCategoryForRequest(mainCategoryId: number): void {
    const previousMainCategoryId = this.mainCategoryId;
    this.mainCategoryId = mainCategoryId;
    this.selectedMainCategoryForRequest = this.mainCategories.find(cat => cat.id === mainCategoryId);

    if (previousMainCategoryId !== this.mainCategoryId || !mainCategoryId) {
      this.resetSubCategoriesAndParameters();
    }

    if (this.selectedMainCategoryForRequest) {
      this.subCategoriesForHouseRequest = [...this.standardSubCategories,
        ...this.selectedMainCategoryForRequest.subCategories];
    } else {
      this.subCategoriesForHouseRequest = [...this.standardSubCategories];
    }
  }

  selectSubCategoryForRequest(subCategoryId: number): void {
    const previousSubCategoryId = this.subCategoryId;
    this.subCategoryId = subCategoryId;
    this.selectedSubCategoryForRequest = this.subCategoriesForHouseRequest.find(sub => sub.id === subCategoryId);

    if (previousSubCategoryId !== this.subCategoryId || !subCategoryId) {
      this.resetParameters();
    }

    if (this.subCategoryId) {
      this.getParametersBySubCategoryId(this.subCategoryId);
    } else {
      this.parameters = [...this.standardParameters];
    }
  }

  onSelectChangeParameter(parameterId: number, value: number): void {
    const existingParam = this.selectiveParameterValues.get(parameterId);
    if (existingParam) {
      if (value === null || value <= 0 || value === undefined) {
        this.selectiveParameterValues.delete(parameterId);
      } else {
        existingParam.value = value;
      }
    } else {
      if (value !== null && value > 0) {
        this.selectiveParameterValues.set(parameterId, {parameterId, value});
      }
    }
  }

  onLocationSelectChangeParameter(locationId: number): void {
    if (!this.locationParameter?.selectiveParameterValues) return;

    this.selectedLocationId = locationId;
    const selectedLocation = this.locationParameter.selectiveParameterValues.find(sp => sp.id === locationId);

    if (selectedLocation) {
      this.location = selectedLocation.name;

      if (!this.selectiveParameterValues.has(this.locationParameter.id)) {
        this.selectiveParameterValues.set(this.locationParameter.id, {
          parameterId: this.locationParameter.id,
          value: locationId,
        });
      } else {
        this.selectiveParameterValues.get(this.locationParameter.id).value = locationId;
      }
    }
  }

  onSelectPriceType(event: Event): void {
    const selectElement = event.target as HTMLSelectElement;
    this.priceType = selectElement.value ? PriceType[String(selectElement.value)] : null;
  }

  onInputChangeParameter(parameterId: number, event: Event): void {
    const inputElement = event.target as HTMLInputElement;
    const value = inputElement.value ? Number(inputElement.value) : 0;

    if (!this.inputParameterValues.has(parameterId)) {
      this.inputParameterValues.set(parameterId, {parameterId, value: value});
    }

    this.inputParameterValues.get(parameterId).value = value;

    if (!value || value <= 0) {
      this.inputParameterValues.delete(parameterId);
    }
  }

  getSelectedSelectParameter(parameterId: number): number {
    const selectedParam = Array.from(this.selectiveParameterValues.values()).find(
      (param) => param?.parameterId === parameterId);
    if (!selectedParam || !selectedParam.value) return 0;

    const parametersArray = this.parameters as ParameterDto[];
    if (!Array.isArray(parametersArray)) return 0;

    const parameter = parametersArray.find((p) => p.id === parameterId);
    if (!parameter || !parameter.selectiveParameterValues) return 0;

    return selectedParam.value;
  }

  // ==================== FORM DATA MANAGEMENT ====================
  private assignHouseDataToForm(): void {
    this.house = {...this.originalHouse};
    this.mainCategories = [{id: this.house.mainCategory.id, name: this.house.mainCategory.name, subCategories: []}];
    this.selectedMainCategoryForRequest = this.mainCategories[0];
    this.mainCategoryId = this.house.mainCategory.id;
    this.subCategoriesForHouseRequest = [{id: this.house.subCategory.id, name: this.house.subCategory.name}];
    this.selectedSubCategoryForRequest = this.subCategoriesForHouseRequest[0];
    this.subCategoryId = this.house.subCategory.id;
    this.parameters = [];
    this.selectiveParameterValues.clear();
    this.inputParameterValues.clear();

    // Process Selective Parameters, excluding LOCATION and PRICE
    this.house.selectiveParameters.forEach(sp => {
      if (sp.parameter.code !== 'LOCATION' && sp.parameter.code !== 'PRICE') {
        const paramDto: ParameterDto = {
          id: sp.parameter.id,
          code: sp.parameter.code || '',
          name: sp.parameter.name,
          enabled: sp.parameter.enabled,
          type: ParameterTypeEnum.SELECT,
          createDate: sp.parameter.createDate,
          updateDate: sp.parameter.updateDate,
          subCategory: {id: this.subCategoryId, name: this.house.subCategory.name},
          mainCategory: {id: this.mainCategoryId, name: this.house.mainCategory.name},
          selectiveParameterValues: sp.parameter.selectiveParameterValues || [],
        };
        this.parameters.push(paramDto);
        this.selectiveParameterValues.set(sp.parameter.id, {parameterId: sp.parameter.id, value: sp.id});
      }
    });

    // Process Input Parameters, excluding LOCATION and PRICE (though typically input params won’t have these codes)
    this.house.inputParameters.forEach(ip => {
      if (ip.parameter.code !== 'LOCATION' && ip.parameter.code !== 'PRICE') {
        const paramDto: ParameterDto = {
          id: ip.parameter.id,
          code: ip.parameter.code || '',
          name: ip.parameter.name,
          enabled: ip.parameter.enabled,
          type: ParameterTypeEnum.INPUT,
          createDate: ip.parameter.createDate,
          updateDate: ip.parameter.updateDate,
          subCategory: {id: this.subCategoryId, name: this.house.subCategory.name},
          mainCategory: {id: this.mainCategoryId, name: this.house.mainCategory.name},
          inputParameterValues: ip.parameter.inputParameterValues || [],
        };
        this.parameters.push(paramDto);
        this.inputParameterValues.set(ip.parameter.id, {parameterId: ip.parameter.id, value: ip.value});
      }
    });

    // Price and Location Assignment (handled separately)
    this.price = this.house.price;
    this.priceType = this.house.priceType;
    const locationParam = this.house.selectiveParameters.find(sp => sp.parameter?.code === 'LOCATION');
    if (locationParam) {
      this.locationParameter = {
        id: locationParam.parameter.id,
        code: locationParam.parameter.code || '',
        name: locationParam.parameter.name,
        enabled: locationParam.parameter.enabled,
        type: ParameterTypeEnum.SELECT,
        createDate: locationParam.parameter.createDate,
        updateDate: locationParam.parameter.updateDate,
        subCategory: null,
        mainCategory: null,
        selectiveParameterValues: locationParam.parameter.selectiveParameterValues || [],
      };
      this.selectedLocationId = locationParam?.id || null;
      this.location = locationParam?.name || this.house.location;
    }
    this.loaded = true;
    this.cdr.detectChanges();
  }

  private resetSubCategoriesAndParameters() {
    this.subCategoryId = null;
    this.selectedSubCategoryForRequest = undefined;
    this.subCategoriesForHouseRequest = [];
    this.resetParameters();
  }

  private resetParameters() {
    const preservedSelectiveValues = new Map<number, CreateInputParameterValueRequest>();
    const preservedInputValues = new Map<number, CreateInputParameterValueRequest>();

    this.standardParameters.forEach(param => {
      const selectiveValue = this.selectiveParameterValues.get(param.id);
      if (selectiveValue !== undefined) {
        preservedSelectiveValues.set(param.id, selectiveValue);
      }

      const inputValue = this.inputParameterValues.get(param.id);
      if (inputValue !== undefined) {
        preservedInputValues.set(param.id, inputValue);
      }
    });

    if (this.locationParameter && this.selectedLocationId) {
      preservedSelectiveValues.set(this.locationParameter.id, {
        parameterId: this.locationParameter.id,
        value: this.selectedLocationId,
      });
    }

    this.parameters = [...this.standardParameters];
    this.selectiveParameterValues = preservedSelectiveValues;
    this.inputParameterValues = preservedInputValues;

    this.house.price = this.price || 0;
    this.house.priceType = this.priceType as PriceType || PriceType.MONTH;
    this.house.location = this.location || '';
  }

  private dataLoaded = false;

  // ==================== EDIT MODE MANAGEMENT ====================
  toggleEditMode(): void {
    const hasDisabled = this.hasDisabled();
    this.isEditMode = !this.isEditMode;

    if (!this.isEditMode) {
      this.assignHouseDataToForm();
    } else {
      this.getCategories();
      if (hasDisabled) {
        this.dataLoaded = false; // Reset flag
        this.house.mainCategory = null;
        this.house.subCategory = null;
        this.house.inputParameters = [];
        this.house.selectiveParameters = [];

        this.mainCategoryId = null;
        this.subCategoryId = null;
        this.selectedMainCategoryForRequest = null;
        this.selectedSubCategoryForRequest = null;
        this.selectiveParameterValues.clear();
        this.inputParameterValues.clear();
      } else if (this.subCategoryId) {
        this.dataLoaded = false; // Reset flag
        this.getParametersBySubCategoryId(this.subCategoryId);
      }
    }
  }

  hasDisabled(): boolean {
    const house = this.house;
    return [
      () => !house.mainCategory?.enabled,
      () => !house.subCategory?.enabled,
      () => house.selectiveParameters?.some(sp => !sp.enabled || !sp.parameter?.enabled),
      () => house.inputParameters?.some(ip => !ip.enabled || !ip.parameter?.enabled),
    ].some(check => check());
  }

  private checkDisabledCategories(): void {
    if (this.hasDisabled()) {
      this.warnings.push({
        id: this.warningIdCounter++,
        message: 'Bu evin əsas kateqoriyası, alt kateqoriyası və ya parametrləri deaktiv edilib. Yalnız şəkil, video, qiymət, bölgə və açıqlama dəyişdirilə bilər.',
        type: 'danger',
      });
    }
  }

  // ==================== MEDIA MANAGEMENT ====================
  uploadMedia(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files) return;

    const files = Array.from(input.files);
    files.forEach(file => {
      const isVideo = file.type.startsWith('video');

      if (file.size > this.maxPhotoFileSize && !isVideo) {
        this.toaster.danger(`${file.name} şəkli 5MB-dan böyükdür`, 'Xəta');
        return;
      } else if (file.size > this.maxVideoFileSize && isVideo) {
        this.toaster.danger(`${file.name} video 100MB-dan böyükdür`, 'Xəta');
        return;
      }

      const currentCount = isVideo ? (this.house.houseVideo ? 1 : 0) : (this.house.houseImages?.length || 0);
      const maxAllowed = isVideo ? this.maxVideo : this.maxPhotos;

      if (currentCount >= maxAllowed) {
        this.toaster.warning(isVideo ? 'Yalnız 1 video əlavə edilə bilər' : 'Maksimum 10 şəkil əlavə edilə bilər', 'Xəta');
        return;
      }

      this.uploadingFiles.add(file.name); // Track upload

      this.fileService.processAndUploadFile(file).subscribe({
        next: (response) => {
          this.uploadingFiles.delete(file.name); // Upload done
          if (isVideo) {
            this.house.houseVideo = response;
          } else {
            const image: HouseImageDto = {
              path: response, fileName: file.name, id: null,
              updateDate: new Date(), createDate: null, house: null,
            };
            this.house.houseImages = this.house.houseImages || [];
            this.house.houseImages.push(image);
            if (!this.house.coverImage) this.house.coverImage = image.path;
          }
          this.toaster.success('Fayl uğurla yükləndi', 'Uğur');
          if (this.currentSlide !== 0)
            this.nextSlide();
        },
        error: (err: any) => {
          const errorMessage = typeof err === 'string' ? err : err.message || 'Bilinməyən xəta';
          this.toaster.danger(errorMessage, 'Xəta');
        },
      });
    });
  }

  deleteMedia(index: number, isVideo: boolean): void {
    this.deleting = true;
    if (isVideo) {
      this.fileService.deleteFile(this.house.houseVideo).subscribe({
        next: () => {
          this.house.houseVideo = undefined;
          this.toaster.success('Video uğurla silindi', 'Uğur');
          if (this.currentSlide !== 0)
            this.prevSlide();
          this.deleting = false;
        },
        error: (err) => {this.toaster.danger(err, 'Xəta'); this.deleting = false; },
      });
    } else {
      const image = this.house.houseImages[index];
      this.fileService.deleteFile(image.path).subscribe({
        next: () => {
          this.house.houseImages.splice(index, 1);
          if (this.house.coverImage === image.path) {
            this.house.coverImage = this.house.houseImages.length > 0 ? this.house.houseImages[0].path : undefined;
          }
          this.toaster.success('Şəkil uğurla silindi', 'Uğur');
          if (this.currentSlide !== 0)
            this.prevSlide();
          this.deleting = false;
        },
        error: (err) => {this.toaster.danger(err, 'Xəta');  this.deleting = false; },
        });
    }
  }

  setCoverImage(index: number): void {
    this.house.coverImage = this.house.houseImages[index].path;
    this.toaster.success('Qapaq şəkli uğurla təyin edildi', 'Uğur');
  }

  // ==================== SLIDER MANAGEMENT ====================
  nextSlide(): void {
    const totalSlides = (this.house.houseImages?.length || 0) + (this.house.houseVideo ? 1 : 0);
    this.currentSlide = (this.currentSlide + 1) % totalSlides;
  }

  prevSlide(): void {
    const totalSlides = (this.house.houseImages?.length || 0) + (this.house.houseVideo ? 1 : 0);
    this.currentSlide = (this.currentSlide - 1 + totalSlides) % totalSlides;
  }

  goToSlide(index: number): void {
    this.currentSlide = index;
  }

  // ==================== VALIDATION & SUBMISSION ====================
  private validateHouse(): boolean {
    if (!this.house.price || !this.house.location || !this.house.mainCategory?.id || !this.house.priceType) {
      this.toaster.danger('Qiymət, yer və əsas kateqoriya mütləq daxil edilməlidir', 'Xəta');
      return false;
    }
    if (this.house.name && this.house.name.length > 70) {
      this.toaster.danger('Ad 70 simvoldan çox ola bilməz', 'Xəta');
      return false;
    }
    if (this.house.description && this.house.description.length > 1000) {
      this.toaster.danger('Açıqlama 1000 simvoldan çox ola bilməz', 'Xəta');
      return false;
    }
    if (this.house.inputParameters?.some(ip => ip.value > 2147000000)) {
      this.toaster.danger('Yazılan rəqəmlərdə 2147000000 limitini keçən rəqəm var. ' +
        'Zəhmət olmasa səhvi düzəltin', 'Xəta');
      return false;
    }
    return true;
  }

  private generateHouseNameIfEmpty(): void {
    if (!this.house.name && this.house.subCategory && this.house.inputParameters) {
      const subCategoryName = this.house.subCategory.name || '';
      const paramNames = this.house.selectiveParameters
        .slice(0, 3)
        .map(ip => `${ip.parameter.name} ${ip.name || ''}`)
        .join(' ');
      this.house.name = `${subCategoryName} ${paramNames}`.trim();
    }
  }

  generateCoverImage(): void {
    if (!this.house.coverImage) {
      this.house.coverImage = this.house.houseImages[0]?.path || '';
    }
  }

  prepareHouseRequest(isForSave: boolean = false): boolean {
    const selectiveParams = Array.from(this.selectiveParameterValues.values()).map(item => ({
      id: item.value,
      name: '',
      enabled: true,
      createDate: new Date(),
      updateDate: new Date(),
      parameter: {
        id: item.parameterId,
        name: '',
        enabled: true,
        createDate: new Date(),
        updateDate: new Date(),
        subCategory: {id: this.subCategoryId, name: ''},
        mainCategory: {id: this.mainCategoryId, name: ''},
      } as ParameterDto,
    }));

    const inputParams = Array.from(this.inputParameterValues.values()).map(item => ({
      id: 0,
      code: '',
      value: item.value,
      enabled: true,
      createDate: new Date(),
      updateDate: new Date(),
      parameter: {
        id: item.parameterId,
        name: '',
        enabled: true,
        createDate: new Date(),
        updateDate: new Date(),
        subCategory: {id: this.subCategoryId, name: ''},
        mainCategory: {id: this.mainCategoryId, name: ''},
      } as ParameterDto,
    }));

    const updatedHouse: HouseDto = {
      id: this.house.id,
      name: this.house.name,
      code: this.house.code,
      price: this.price || 0,
      priceType: this.priceType as PriceType || PriceType.MONTH,
      description: this.house.description,
      location: this.location || '',
      coverImage: this.house.coverImage,
      houseVideo: this.house.houseVideo,
      status: this.house.status,
      ownerName: this.house.ownerName,
      ownerNumber: this.house.ownerNumber,
      notes: this.house.notes,
      createDate: new Date(),
      updateDate: new Date(),
      mainCategory: {
        id: this.mainCategoryId || 0,
        name: this.selectedMainCategoryForRequest?.name || '',
        enabled: true,
      },
      subCategory: {
        id: this.subCategoryId || 0,
        name: this.selectedSubCategoryForRequest?.name || '',
        enabled: true,
      },
      houseImages: [...this.house.houseImages],
      selectiveParameters: selectiveParams,
      inputParameters: inputParams,
    };

    this.house = updatedHouse;

    if (this.isEditMode && this.originalHouse && isForSave) {
      if (this.areHousesEqual(this.originalHouse, updatedHouse)) {
        this.toaster.warning('Heç bir dəyişiklik edilməyib', 'Xəbərdarlıq');
        return false;
      }
    }
    return true;
  }

  saveHouse(): void {
    const hasChanges = this.prepareHouseRequest(true);
    if (!hasChanges) return;
    if (!this.validateHouse()) return;
    this.generateCoverImage();
    this.generateHouseNameIfEmpty();

    if (this.isCreateMode) {
      this.houseService.createHouse(this.house).subscribe({
        next: (response: GenericResponse<HouseDto>) => {
          if (response.responseStatus === 200) {
            this.isEditMode = false;
            this.isCreateMode = false;
            this.isSubmitted = true;
            this.originalHouse = {...response.data};
            this.toaster.success('Ev uğurla yaradıldı', 'Uğur');
            localStorage.removeItem('uploadedFiles');
            this.router.navigate(['/pages/house', response.data.id]);
          } else {
            this.toaster.danger('Ev yaradılarkən xəta baş verdi', 'Xəta');
          }
        },
        error: () => this.toaster.danger('Ev yaradılarkən xəta baş verdi', 'Xəta'),
      });
    } else {
      const originalImagePaths = new Set(this.originalHouse.houseImages.map(img => img.path));
      const deletedImages = this.originalHouse.houseImages
        .filter(img => !this.house.houseImages.some(newImg => newImg.path === img.path));
      const deletedVideo = this.originalHouse.houseVideo &&
      this.originalHouse.houseVideo !== this.house.houseVideo ? this.originalHouse.houseVideo : null;

      this.houseService.updateHouse(this.house).subscribe({
        next: (response: GenericResponse<HouseDto>) => {
          if (response.responseStatus === 200) {
            deletedImages.forEach(img => this.fileService.deleteFile(img.path).subscribe());
            if (deletedVideo) this.fileService.deleteFile(deletedVideo).subscribe();

            this.isEditMode = false;
            this.isCreateMode = false;
            this.isSubmitted = true;
            this.originalHouse = {...this.house};
            this.house = {...this.house};
            this.toaster.success('Ev uğurla yeniləndi', 'Uğur');
            localStorage.removeItem('uploadedFiles');
            window.location.reload();
          } else {
            this.toaster.danger('Ev yenilənərkən xəta baş verdi', 'Xəta');
          }
        },
        error: () => this.toaster.danger('Ev yenilənərkən xəta baş verdi', 'Xəta'),
      });
    }
  }

  // ==================== UTILITY METHODS ====================
  get formattedDescription(): string {
    if (!this.house?.description) {
      return 'Açıqlama yoxdur';
    }
    return this.house.description.replace(/\n/g, '<br>');
  }

  get formattedNotes(): string {
    if (!this.house?.notes) {
      return 'Notlar yoxdur';
    }
    return this.house.notes.replace(/\n/g, '<br>');
  }

  private areHousesEqual(original: HouseDto, updated: HouseDto): boolean {
    if (
      original.id !== updated.id ||
      original.name !== updated.name ||
      original.code !== updated.code ||
      original.price !== updated.price ||
      original.priceType !== updated.priceType ||
      original.description !== updated.description ||
      original.location !== updated.location ||
      original.coverImage !== updated.coverImage ||
      original.houseVideo !== updated.houseVideo ||
      original.notes !== updated.notes ||
      original.ownerName !== updated.ownerName ||
      original.ownerNumber !== updated.ownerNumber ||
      original.status !== updated.status ||
      original.mainCategory.id !== updated.mainCategory.id ||
      original.subCategory.id !== updated.subCategory.id
    ) {
      return false;
    }

    if (original.houseImages.length !== updated.houseImages.length) return false;
    for (let i = 0; i < original.houseImages.length; i++) {
      if (
        original.houseImages[i].path !== updated.houseImages[i].path ||
        original.houseImages[i].fileName !== updated.houseImages[i].fileName
      ) return false;
    }

    if (original.selectiveParameters.length !== updated.selectiveParameters.length) return false;
    for (let i = 0; i < original.selectiveParameters.length; i++) {
      if (
        original.selectiveParameters[i].id !== updated.selectiveParameters[i].id ||
        original.selectiveParameters[i].parameter.id !== updated.selectiveParameters[i].parameter.id
      ) return false;
    }

    if (original.inputParameters.length !== updated.inputParameters.length) return false;
    for (let i = 0; i < original.inputParameters.length; i++) {
      if (
        original.inputParameters[i].value !== updated.inputParameters[i].value ||
        original.inputParameters[i].parameter.id !== updated.inputParameters[i].parameter.id
      ) return false;
    }

    return true;
  }

  protected hasChanges(): boolean {
    if (!this.dataLoaded) return false; // Skip check until loaded
    if (!this.isEditMode && !this.isCreateMode) {
      return false; // No changes if neither mode is active
    }

    // Prepare the current house state as a HouseDto
    this.prepareHouseRequest(false); // This updates this.house with the current state
    const currentHouse = {...this.house}; // Clone the prepared house

    if (this.isEditMode && this.originalHouse) {
      // Edit Mode: Compare current house with originalHouse
      return !this.areHousesEqual(this.originalHouse, currentHouse);
    } else if (this.isCreateMode) {
      // Create Mode: Compare current house with an empty house
      const emptyHouse = this.getEmptyHouse();
      return !this.areHousesEqual(emptyHouse, currentHouse);
    }

    return false; // Fallback, though this shouldn’t be reached
  }

  cancelChanges(): void {
    if (this.isEditMode && this.house?.id) {
      // Edit Mode: Revert to original house data
      this.assignHouseDataToForm();

      const originalImagePaths = new Set(this.originalHouse.houseImages.map(img => img.path));
      const newUploads = this.house.houseImages.filter(img => !originalImagePaths.has(img.path));
      newUploads.forEach(img => this.fileService.deleteFile(img.path).subscribe());

      if (this.house.houseVideo && this.house.houseVideo !== this.originalHouse.houseVideo) {
        this.fileService.deleteFile(this.house.houseVideo).subscribe();
      }

      this.isEditMode = false;
      this.toaster.info('Dəyişikliklər ləğv edildi', 'Məlumat');
    } else if (this.isCreateMode) {
      this.loaded = false; // Ensure UI renders after reset
      // Create Mode: Reset to empty house and clean up media
      this.cleanupUnsavedMedia(); // Clean up any uploaded images/videos
      this.house = this.getEmptyHouse(); // Reset to initial empty state
      this.mainCategories = [];
      this.subCategoriesForHouseRequest = [];
      this.parameters = [];
      this.selectiveParameterValues.clear();
      this.inputParameterValues.clear();
      this.price = null;
      this.priceType = PriceType.MONTH;
      this.location = '';
      this.mainCategoryId = null;
      this.subCategoryId = null;
      this.selectedMainCategoryForRequest = null;
      this.selectedSubCategoryForRequest = null;
      this.selectedLocationId = null;
      this.getCategories(); // Reload categories for a fresh start
      this.loaded = true; // Ensure UI renders after reset
      this.toaster.info('Elan Yaratma ləğv edildi', 'Məlumat');
    }
    this.cdr.detectChanges();
  }

  private hasUnsavedChanges(): boolean {
    return !this.areHousesEqual(this.originalHouse, this.house);
  }

  private cleanupUnsavedMedia(): void {
    const originalImagePaths = new Set(this.originalHouse?.houseImages.map(img => img.path));
    const newUploads = this.house?.houseImages.filter(img => !originalImagePaths.has(img.path));
    newUploads.forEach(img => this.fileService.deleteFile(img.path).subscribe());

    if (this.house?.houseVideo && this.house?.houseVideo !== this.originalHouse?.houseVideo) {
      this.fileService.deleteFile(this.house?.houseVideo).subscribe();
    }
  }

  protected readonly ParameterTypeEnum = ParameterTypeEnum;
  houseStatus: boolean;

  deleteHouse() {
    this.houseService.deleteHouse(this.originalHouse.id).subscribe({
      next: (response: GenericResponse<HouseDto>) => {
        if (response.responseStatus === 200) {
          this.toaster.success('Ev uğurla Silindi');
          this.router.navigate(['/pages/houses']);
        } else {
          this.toaster.danger('Ev silinərkən xəta baş verdi', 'Xəta');
          window.location.reload();
        }
      },
      error: () => this.toaster.danger('Ev silinərkən xəta baş verdi', 'Xəta'),
    });
  }

  setHouseStatus(b: boolean) {
    this.houseStatus = b;
    this.house.status = this.houseStatus;
  }
}
