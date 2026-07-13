import {Component, ElementRef, OnInit, ViewChild} from "@angular/core";
import {MainCategoryDTO} from "../../model/category/MainCategoryDTO";
import {SubCategoryDTO} from "../../model/category/SubCategoryDTO";
import {ParametersDTO} from "../../model/category/ParametersDTO";
import {HouseDTO} from "../../model/category/HouseDTO";
import {SelectiveParameterValueDTO} from '../../model/category/SelectiveParameterValueDTO';
import {CategoryService} from '../../@core/utils/category.service';
import {CategoryUpdateRequestDTO} from '../../model/category/CategoryUpdateRequestDTO';
import {Router} from "@angular/router";
import {HttpStatusCode} from "../../model/HttpStatusCode";
import {NbToastrService} from "@nebular/theme";
import {ParameterTypeEnum} from "../../@core/utils/enums/ParameterTypeEnum";


@Component({
  selector: 'ngx-category-management',
  templateUrl: './category-management.component.html',
  styleUrls: ['./category-management.component.scss'],
})
export class CategoryManagementComponent implements OnInit {
  mainCategories: MainCategoryDTO[] = [];
  subCategories: SubCategoryDTO[] = [];
  parameters: ParametersDTO[] = [];
  selectiveParameters: SelectiveParameterValueDTO[] = [];
  derelictHouses: HouseDTO[] = [];
  warnings: { id: number, message: string, type: string }[] = [];
  private warningIdCounter = 0;

  locationParameter: ParametersDTO;
  priceParameter: ParametersDTO;
  private originalMainCategories: MainCategoryDTO[] = [];
  private originalSubCategories: SubCategoryDTO[] = [];
  private originalParameters: ParametersDTO[] = [];
  private originalSelectiveParameters: SelectiveParameterValueDTO[] = [];

  newMainCategory: MainCategoryDTO = {name: '', code: ''};
  newSubCategory: SubCategoryDTO = {name: '', code: '', mainCategoryId: null};
  newParameter: ParametersDTO = {name: '', code: '', type: 'INPUT', subCategoryId: null};
  newSelectiveParameter: SelectiveParameterValueDTO = {
    name: '', code: '',
    parameterId: null,
  };

  showConfirmModal = false;
  affectedHousesCount = 0;

  @ViewChild('topOfPage') topOfPage!: ElementRef;

  constructor(private categoryService: CategoryService, private toaster: NbToastrService, private router: Router) {
  }

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    this.categoryService.getActiveCategories().subscribe({
      next: (response) => {
        if (response.responseStatus === HttpStatusCode.OK) {
          this.priceParameter = response.data?.parameters?.find(fp => fp.code === 'PRICE');
          this.locationParameter = response.data?.parameters?.find(fp => fp.code === 'LOCATION');
          const filteredParameters = response.data?.parameters?.filter(fp => fp.code !== 'LOCATION' && fp.code !== 'PRICE');
          this.mainCategories = JSON.parse(JSON.stringify(response.data?.mainCategories || []));
          this.subCategories = JSON.parse(JSON.stringify(response.data?.subCategories || []));
          this.parameters = JSON.parse(JSON.stringify(filteredParameters || []));
          this.selectiveParameters = JSON.parse(JSON.stringify(response.data?.selectiveParameters || []));
          this.originalMainCategories = JSON.parse(JSON.stringify(response.data?.mainCategories || []));
          this.originalSubCategories = JSON.parse(JSON.stringify(response.data?.subCategories || []));
          this.originalParameters = JSON.parse(JSON.stringify(filteredParameters || []));
          this.originalSelectiveParameters = JSON.parse(JSON.stringify(response.data?.selectiveParameters || []));

          const firstSelectParam = this.parameters.find(p => p.type === 'SELECT');
          this.newSelectiveParameter = {
            name: '',
            code: '',
            parameterId: firstSelectParam ? (firstSelectParam.id || firstSelectParam.tempId) : 0,
          };
        } else {
          this.newSelectiveParameter = { name: '', code: '', parameterId: 0 };
          this.mainCategories = [];
          this.subCategories = [];
          this.parameters = [];
          this.selectiveParameters = [];
          this.originalMainCategories = [];
          this.originalSubCategories = [];
          this.originalParameters = [];
          this.originalSelectiveParameters = [];
          this.toaster.danger('Aktiv kateqoriyaları yükləyərkən xəta baş verdi', 'Xəta');
        }
      },
      error: (err) => { console.error(err); this.toaster.danger('Aktiv kateqoriyaları yükləyərkən xəta baş verdi', 'Xəta'); },
    });
    this.categoryService.getDerelictHouses().subscribe({
      next: (response) => {
        if (response.responseStatus === HttpStatusCode.OK) {
          this.warnings = [];
          this.derelictHouses = response.data || [];
          if (this.derelictHouses.length > 0) {
            this.addUniqueWarning(
              `Əsas kateqoriya, Alt kateqoriya, Parametr və ya Seçmə Parametr dəyəri silinmiş ${
                this.derelictHouses?.length
              } ədəd ev var`,
            );
          }
        } else {
          this.toaster.danger('Tərk edilmiş evləri yoxlayarkən xəta baş verdi', 'Xəta');
        }
      },
      error: () => this.toaster.danger('Tərk edilmiş evləri yoxlayarkən xəta baş verdi', 'Xəta'),
    });
  }

  addWarning(message: string, type: string = 'warning') {
    this.warnings.push({id: this.warningIdCounter++, message, type});
  }

  private addUniqueWarning(message: string) {
    if (!this.warnings.some(w => w.message === message)) {
      this.addWarning(message, 'danger');
    }
  }

  removeWarning(id: number) {
    this.warnings = this.warnings.filter(w => w.id !== id);
  }
  addMainCategory() {
    if (!this.newMainCategory.name || this.newMainCategory.name.length > 70) {
      this.toaster.danger('Ad və ya kod 70 simvoldan çox ola bilməz və boş qala bilməz', 'Xəta');
      return;
    }
    if (this.mainCategories.some(mc => mc.name === this.newMainCategory.name)) {
      this.toaster.danger('Bu adda əsas kateqoriya artıq mövcuddur', 'Xəta');
      return;
    }
    const existingIds = this.mainCategories.map(mc => mc.id || mc.tempId);
    const newCategory = {
      ...this.newMainCategory,
      tempId: this.generateUniqueTempId(existingIds),
    };
    this.mainCategories.push(newCategory);
    this.newMainCategory = {name: '', code: ''};
  }

  addSubCategory() {
    if (!this.newSubCategory.name || this.newSubCategory.name.length > 70) {
      this.toaster.danger('Ad və ya kod 70 simvoldan çox ola bilməz və boş qala bilməz', 'Xəta');
      return;
    }
    if (this.newSubCategory.mainCategoryId === undefined) {
      this.toaster.danger('Alt kateqoriyanın aidiyyəti seçilməyib (Əsas kateqoriya və ya Standart)');
      return;
    }

    if (this.subCategories.some(sc => sc.name === this.newSubCategory.name &&
      sc.mainCategoryId === this.newSubCategory.mainCategoryId)) {
      this.toaster.danger('Bu adda alt kateqoriya seçilən əsas kateqoriya daxilində yada standard olaraq artıq mövcuddur');
      return;
    }
    const existingIds = this.subCategories.map(sc => sc.id || sc.tempId);
    const newSubCat = {
      ...this.newSubCategory,
      tempId: this.generateUniqueTempId(existingIds),
    };
    this.subCategories.push(newSubCat);
    this.newSubCategory = {name: '', code: '', mainCategoryId: null};
  }

  addParameter() {
    if (!this.newParameter.name || this.newParameter.name.length > 70) {
      this.toaster.danger('Ad və ya kod 70 simvoldan çox ola bilməz və boş qala bilməz', 'Xəta');
      return;
    }

    if (this.newParameter.subCategoryId === undefined) {
      this.toaster.danger('Parametrin aidiyyəti seçilməyib (Alt kateqoriya və ya Standart)');
      return;
    }

    if (this.parameters.some(p => p.name === this.newParameter.name &&
      p.subCategoryId === this.newParameter.subCategoryId)) {
      this.toaster.danger('Bu adda parametr seçilən alt kateqoriya daxilində yada standard olaraq artıq mövcuddur');
      return;
    }
    const existingIds = this.parameters.map(p => p.id || p.tempId);
    const newParam = {
      ...this.newParameter,
      tempId: this.generateUniqueTempId(existingIds),
    };
    this.parameters.push(newParam);
    this.newParameter = {name: '', code: '', type: 'INPUT', subCategoryId: null};
  }

  addSelectiveParameter() {
    if (!this.newSelectiveParameter.name || this.newSelectiveParameter.name.length > 70) {
      this.toaster.danger('Ad və ya kod 70 simvoldan çox ola bilməz və boş qala bilməz', 'Xəta');
      return;
    }

    if (!this.newSelectiveParameter.parameterId) {
      this.toaster.danger('Seçim parametri dəyərinin aid olduğu parametr seçilməyib');
      return;
    }

    if (this.selectiveParameters.some(sp => sp.name === this.newSelectiveParameter.name &&
      sp.parameterId === this.newSelectiveParameter.parameterId)) {
      this.toaster.danger('Bu adda seçim parametr dəyəri seçilən parametr daxilində artıq mövcuddur');
      return;
    }
    const existingIds = this.selectiveParameters.map(sp => sp.id || sp.tempId);
    const newSelParam = {
      ...this.newSelectiveParameter,
      tempId: this.generateUniqueTempId(existingIds),
    };
    this.selectiveParameters.push(newSelParam);
    this.newSelectiveParameter = {
      name: '',
      code: '',
      parameterId: this.parameters[0]?.id || this.parameters[0]?.tempId || 0,
    };
  }
  deleteItem(index: number, type: string) {
    if (type === 'mainCategory') {
      this.mainCategories.splice(index, 1);
    } else if (type === 'subCategory') {
      this.subCategories.splice(index, 1);
    } else if (type === 'parameter') {
      const parameterToDelete = this.parameters[index];
      const parameterCode = parameterToDelete.code;
      if (parameterCode !== 'LOCATION' && parameterCode !== 'PRICE') {
        this.parameters.splice(index, 1);
      } else {
        this.toaster.danger('Qiymət yada Bölgə parametri silinə bilməz', 'Xəta');
      }
    } else if (type === 'selectiveParameter') {
      this.selectiveParameters.splice(index, 1);
    }
  }

  checkDublicateNames(): boolean {
    const mainCategoryNames = new Set<string>();
    const subCategoryNames = new Map<number | string, Set<string>>();
    const parameterNames = new Map<number | string, Set<string>>();
    const selectParameterValuesNames = new Map<number | string, Set<string>>();

    let hasErrors = false;
    for (const mc of this.mainCategories) {
      if (!mc.name || mc.name.length > 70) {
        this.addUniqueWarning('Əsas kateqoriyada ad və ya kod boş qala bilməz və 70 simvoldan çox ola bilməz');
        hasErrors = true;
        continue;
      }
      if (mainCategoryNames.has(mc.name) &&
        this.mainCategories.filter(m => m.name === mc.name).length > 1) {
        this.addWarning(`"${mc.name}" adlı əsas kateqoriya artıq mövcuddur`, 'danger');
        hasErrors = true;
        continue;
      }
      mainCategoryNames.add(mc.name);
    }
    for (const sc of this.subCategories) {
      if (!sc.name || sc.name.length > 70) {
        this.addUniqueWarning('Alt kateqoriyada ad və ya kod boş qala bilməz və 70 simvoldan çox ola bilməz');
        hasErrors = true;
        continue;
      }
      const key = sc.mainCategoryId || 'null';
      if (!subCategoryNames.has(key)) {
        subCategoryNames.set(key, new Set<string>());
      }
      const categoryNames = subCategoryNames.get(key) as Set<string>;
      if (categoryNames.has(sc.name) &&
        this.subCategories.filter(s => s.name === sc.name && s.mainCategoryId === sc.mainCategoryId).length > 1) {
        const mainCategoryName =
          this.mainCategories.find(mc => mc.id === sc.mainCategoryId || mc.tempId === sc.mainCategoryId)?.name || 'Standart';
        this.addWarning(`"${sc.name}" adlı alt kateqoriya "${mainCategoryName}" altında artıq mövcuddur`, 'danger');
        hasErrors = true;
        continue;
      }
      categoryNames.add(sc.name);
    }
    for (const p of this.parameters) {
      if (!p.name || p.name.length > 70) {
        this.addUniqueWarning('Parametrdə ad boş qala bilməz və 70 simvoldan çox ola bilməz');
        hasErrors = true;
        continue;
      }
      const key = p.subCategoryId || 'null';
      if (!parameterNames.has(key)) {
        parameterNames.set(key, new Set<string>());
      }
      const paramNames = parameterNames.get(key) as Set<string>;
      if (paramNames.has(p.name) &&
        this.parameters.filter(param => param.name === p.name && param.subCategoryId === p.subCategoryId).length > 1) {
        const subCategoryName =
          this.subCategories.find(sc => sc.id === p.subCategoryId || sc.tempId === p.subCategoryId)?.name || 'Standart';
        this.addWarning(`"${p.name}" adlı parametr "${subCategoryName}" altında artıq mövcuddur`, 'danger');
        hasErrors = true;
        continue;
      }
      paramNames.add(p.name);
    }
    for (const sp of this.selectiveParameters) {
      if (!sp.name || sp.name.length > 70) {
        this.addUniqueWarning('Seçim parametr dəyərində ad və ya kod boş qala bilməz və 70 simvoldan çox ola bilməz');
        hasErrors = true;
        continue;
      }
      const key = sp.parameterId || 'null';
      if (!selectParameterValuesNames.has(key)) {
        selectParameterValuesNames.set(key, new Set<string>());
      }
      const selectParamNames = selectParameterValuesNames.get(key) as Set<string>;
      if (selectParamNames.has(sp.name) &&
        this.selectiveParameters.filter(s => s.name === sp.name && s.parameterId === sp.parameterId).length > 1) {
        const paramName = this.parameters.find(p => p.id === sp.parameterId || p.tempId === sp.parameterId)?.name || 'Bilinməyən Parametr';
        this.addWarning(`"${sp.name}" adlı seçim parametr dəyəri "${paramName}" altında artıq mövcuddur`, 'danger');
        hasErrors = true;
        continue;
      }
      selectParamNames.add(sp.name);
    }

    return !hasErrors;
  }

  checkParametersWithoutValues(): boolean {
    const selectParameters = this.parameters.filter(p => p.type === 'SELECT');
    const parametersWithoutValues = selectParameters.filter(param => {
      const hasValues = this.selectiveParameters.some(sp =>
        sp.parameterId === param.id || sp.parameterId === param.tempId);
      return !hasValues;
    });

    if (parametersWithoutValues.length > 0) {
      const parameterNames = parametersWithoutValues.map(p => p.name).join(', ');
      this.toaster.danger(
        `Aşağıdakı seçim parametrləri üçün dəyərlər təyin edilməyib: ${parameterNames}.
      Zəhmət olmasa, hər bir seçim parametri üçün ən azı bir dəyər əlavə edin.`,
        'Xəta',
      );
      this.warnings = this.warnings.filter(w => !w.message.includes('Aşağıdakı seçim parametrləri üçün dəyərlər təyin edilməyib'));
      this.addWarning(`Aşağıdakı seçim parametrləri üçün dəyərlər təyin edilməyib: ${parameterNames}.
      Zəhmət olmasa, hər bir seçim parametri üçün ən azı bir dəyər əlavə edin.`, 'warning');
      this.topOfPage.nativeElement.scrollIntoView({ behavior: 'smooth' });
      return false;
    }
    return true;
  }
  private hasChanged(original: any, current: any): boolean {
    return JSON.stringify(original) !== JSON.stringify(current);
  }

  private generateUniqueTempId(existingIds: (number | undefined)[]): number {
    const maxAttempts = 10;
    let tempId: number;
    let attempts = 0;

    do {
      tempId = Math.floor(100000 + Math.random() * 900000);
      attempts++;
      if (attempts > maxAttempts) {
        throw new Error('Unable to generate unique tempId after maximum attempts');
      }
    } while (existingIds.includes(tempId));

    return tempId;
  }

  private prepareUpdateRequest(): CategoryUpdateRequestDTO {
    return {
      mainCategoriesToUpdate: this.mainCategories
        .filter(mc => !mc.id || this.hasChanged(
          this.originalMainCategories.find(omc => omc.id === mc.id),
          mc,
        ))
        .map(mc => ({
          id: mc.id,
          tempId: mc.tempId,
          name: mc.name,
          code: mc.code,
        })),
      subCategoriesToUpdate: this.subCategories
        .filter(sc => !sc.id || this.hasChanged(
          this.originalSubCategories.find(osc => osc.id === sc.id),
          sc,
        ))
        .map(sc => ({
          id: sc.id,
          tempId: sc.tempId,
          name: sc.name,
          code: sc.code,
          mainCategoryId: sc.mainCategoryId, // Send tempId or real id
        })),
      parametersToUpdate: this.parameters
        .filter(p => !p.id || this.hasChanged(
          this.originalParameters.find(op => op.id === p.id),
          p,
        ))
        .map(p => ({
          id: p.id,
          tempId: p.tempId,
          name: p.name,
          code: p.code,
          type: p.type,
          subCategoryId: p.subCategoryId, // Send tempId or real id
        })),
      selectiveParametersToUpdate: this.selectiveParameters
        .filter(sp => !sp.id || this.hasChanged(
          this.originalSelectiveParameters.find(osp => osp.id === sp.id),
          sp,
        ))
        .map(sp => ({
          id: sp.id,
          tempId: sp.tempId,
          name: sp.name,
          code: sp.code,
          parameterId: sp.parameterId, // Send tempId or real id
        })),
      mainCategoryIdsToDelete: this.originalMainCategories
        .filter(omc => !this.mainCategories.some(mc => mc.id === omc.id))
        .map(omc => omc.id as number),
      subCategoryIdsToDelete: this.originalSubCategories
        .filter(osc => !this.subCategories.some(sc => sc.id === osc.id))
        .map(osc => osc.id as number),
      parameterIdsToDelete: this.originalParameters
        .filter(op => !this.parameters.some(p => p.id === op.id))
        .map(op => op.id as number),
      selectiveParameterIdsToDelete: this.originalSelectiveParameters
        .filter(osp => !this.selectiveParameters.some(sp => sp.id === osp.id))
        .map(osp => osp.id as number),
    };
  }
  submitChanges() {
    if (!this.checkDublicateNames()) {
      this.topOfPage.nativeElement.scrollIntoView({ behavior: 'smooth' });
      return;
    }
    if (!this.checkParametersWithoutValues()) {
      this.topOfPage.nativeElement.scrollIntoView({ behavior: 'smooth' });
      return;
    }

    const request: CategoryUpdateRequestDTO = this.prepareUpdateRequest();

    this.categoryService.checkCategoryParametersHouses({
      mainCategoryIds: request.mainCategoryIdsToDelete,
      subCategoryIds: request.subCategoryIdsToDelete,
      parameterIds: request.parameterIdsToDelete,
      selectiveParameterIds: request.selectiveParameterIdsToDelete,
    }).subscribe({
      next: (response) => {
        if (response.responseStatus === HttpStatusCode.OK) {
          this.affectedHousesCount = response.data || 0;
          if (this.affectedHousesCount > 0) {
            this.showConfirmModal = true;
          } else {
            this.saveChanges(request);
          }
        } else {
          this.toaster.danger('Evlərin sayını yoxlayarkən xəta baş verdi', 'Xəta');
        }
        },
      error: () => this.toaster.danger('Evlərin sayını yoxlayarkən xəta baş verdi', 'Xəta'),
    });
  }

  confirmSave() {
    const request: CategoryUpdateRequestDTO = this.prepareUpdateRequest();
    this.saveChanges(request);
  }

  saveChanges(request: CategoryUpdateRequestDTO) {
    this.categoryService.updateCategories(request).subscribe({
      next: (response) => {
        if (response.responseStatus === HttpStatusCode.OK) {
          this.loadData();
          this.showConfirmModal = false;
          this.warnings = [];
          this.toaster.success('Uğurla qeyd edildi');
        } else {
          this.toaster.danger('Dəyişiklikləri saxlayarkən xəta baş verdi', 'Xəta');
        }
      },
      error: () => this.toaster.danger('Dəyişiklikləri saxlayarkən xəta baş verdi', 'Xəta'),
    });
  }

  isSelectTypePresent(): boolean {
    return this.parameters.some(p => p.type === 'SELECT') || !!this.locationParameter;
  }

  goToHouse(id: number) {
    this.router.navigate(['/pages/house', id]);
  }

  protected readonly window = window;
  protected readonly ParameterTypeEnum = ParameterTypeEnum;
}
