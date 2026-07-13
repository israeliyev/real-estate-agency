import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { NbToastrService } from '@nebular/theme';
import { HouseService } from '../../@core/utils/house.service';
import { SectionDto } from '../../model/SectionDto';
import { HouseCardDto } from '../../model/HouseCardDto';
import { GetFilterHousesRequest } from '../../model/GetFilterHousesRequest';
import { OrderEnum } from '../../model/base/OrderEnum';
import { HttpStatusCode } from '@angular/common/http';

@Component({
  selector: 'ngx-section',
  templateUrl: './section.component.html',
  styleUrls: ['./section.component.scss'],
})
export class SectionComponent implements OnInit {
  sections: SectionDto[] = [];
  houses: HouseCardDto[] = [];
  selectedPage: 'HOMEPAGE' | 'HOUSES' = 'HOMEPAGE';
  newSectionName: string = '';
  maxSectionNameLength = 200;
  maxHousesPerSection = 5;
  selectedSection: SectionDto | null = null;
  pageNumber = 1;
  pageSize = 20;
  totalElements = 0;
  totalPages = 0;
  loading = false;
  orderType = OrderEnum.LAST;

  constructor(
    private houseService: HouseService,
    private toastrService: NbToastrService,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.loadSections();
    this.fetchFilteredHouses();
  }

  loadSections(): void {
    this.houseService.getSectionsByPage(this.selectedPage).subscribe({
      next: (response) => {
        if (response.responseStatus === 200 && response.data) {
          this.sections = response.data;
          if (this.selectedSection) {
            this.selectedSection = this.sections.find(
              (s) => s.id === this.selectedSection?.id,
            ) || null;
          }
        } else {
          this.toastrService.danger('Bölmələri yükləmək alınmadı', 'Xəta');
          this.sections = [];
          this.selectedSection = null;
        }
      },
      error: (err) => {
        this.toastrService.danger('Bölmələri yükləmək alınmadı', 'Xəta');
        console.error('Error fetching sections:', err);
      },
    });
  }

  fetchFilteredHouses(): void {
    this.loading = true;
    const request: GetFilterHousesRequest = {
      sort: this.orderType,
      searchKey: null,
      mainCategoryId: null,
      subCategoryId: null,
      selectiveParameterIds: [],
      inputParametersRanges: [],
      pageNumber: this.pageNumber,
    };

    this.houseService.getHousesByfilter(request).subscribe({
      next: (response) => {
        if (response.responseStatus === HttpStatusCode.Ok && response.data) {
          this.houses = response.data;
          this.totalElements = response.totalElements || 0;
          this.totalPages = response.totalPages || Math.ceil(this.totalElements / this.pageSize);
          this.pageNumber = response.pageNumber || this.pageNumber;
          this.loading = false;
          this.cdr.detectChanges();
        } else {
          this.toastrService.danger('Evləri tapılmadı', 'Xəta');
          this.houses = [];
          this.totalElements = 0;
          this.totalPages = 0;
          this.loading = false;
        }
      },
      error: (err) => {
        this.toastrService.danger('Evləri yükləmək alınmadı', 'Xəta');
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
  }

  switchPage(page: 'HOMEPAGE' | 'HOUSES'): void {
    this.selectedPage = page;
    this.selectedSection = null;
    this.loadSections();
  }

  addSection(): void {
    if (!this.newSectionName || this.newSectionName.length > this.maxSectionNameLength) {
      this.toastrService.warning(
        `Bölmə adı boş ola bilməz və ${this.maxSectionNameLength} simvoldan çox olmamalıdır`,
        'Xəbərdarlıq',
      );
      return;
    }

    const createSectionRequest = {
      sectionName: this.newSectionName,
      houseIds: [],
      page: this.selectedPage,
    };

    this.houseService.createSection(createSectionRequest).subscribe({
      next: (response) => {
        if (response.responseStatus === 200) {
          this.toastrService.success('Bölmə uğurla yaradıldı', 'Uğur');
          this.newSectionName = '';
          this.loadSections();
        } else {
          this.toastrService.danger('Bölmə yaratmaq alınmadı', 'Xəta');
        }
      },
      error: (err) => {
        this.toastrService.danger('Bölmə yaratmaq alınmadı', 'Xəta');
        console.error('Error creating section:', err);
      },
    });
  }

  updateSection(section: SectionDto): void {
    if (section.name.length > this.maxSectionNameLength) {
      this.toastrService.warning(
        `Bölmə adı ${this.maxSectionNameLength} simvoldan çox ola bilməz`,
        'Xəbərdarlıq',
      );
      return;
    }

    const updateSectionRequest = {
      sectionId: section.id,
      sectionName: section.name,
      houseIds: section.houses.map((house) => house.id),
    };

    this.houseService.updateSection(updateSectionRequest).subscribe({
      next: (response) => {
        if (response.responseStatus === 200) {
          this.toastrService.success('Bölmə uğurla yeniləndi', 'Uğur');
          this.loadSections();
        } else {
          this.toastrService.danger('Bölmə yeniləmək alınmadı', 'Xəta');
        }
      },
      error: (err) => {
        this.toastrService.danger('Bölmə yeniləmək alınmadı', 'Xəta');
        console.error('Error updating section:', err);
      },
    });
  }

  deleteSection(sectionId: number): void {
    this.houseService.deleteSection(sectionId).subscribe({
      next: (response) => {
        if (response.responseStatus === 200) {
          this.toastrService.success('Bölmə uğurla silindi', 'Uğur');
          if (this.selectedSection?.id === sectionId) {
            this.selectedSection = null;
          }
          this.loadSections();
        } else {
          this.toastrService.danger('Bölmə silmək alınmadı', 'Xəta');
        }
      },
      error: (err) => {
        this.toastrService.danger('Bölmə silmək alınmadı', 'Xəta');
        console.error('Error deleting section:', err);
      },
    });
  }

  addHouseToSection(houseId: number): void {
    if (!this.selectedSection) return;

    if (this.selectedSection.houses.length >= this.maxHousesPerSection) {
      this.toastrService.warning(
        `Bir bölmədə maksimum ${this.maxHousesPerSection} ev ola bilər`,
        'Xəbərdarlıq',
      );
      return;
    }

    const updateSectionRequest = {
      sectionId: this.selectedSection.id,
      sectionName: this.selectedSection.name,
      houseIds: [...this.selectedSection.houses.map((h) => h.id), houseId],
    };

    this.houseService.updateSection(updateSectionRequest).subscribe({
      next: (response) => {
        if (response.responseStatus === 200) {
          this.toastrService.success('Ev bölməyə uğurla əlavə olundu', 'Uğur');
          this.loadSections();
        } else {
          this.toastrService.danger('Bölmə yeniləmək alınmadı', 'Xəta');
        }
      },
      error: (err) => {
        this.toastrService.danger('Ev əlavə etmək alınmadı', 'Xəta');
        console.error('Error adding house to section:', err);
      },
    });
  }

  removeHouseFromSection(section: SectionDto, houseId: number): void {
    const updateSectionRequest = {
      sectionId: section.id,
      sectionName: section.name,
      houseIds: section.houses.filter((h) => h.id !== houseId).map((h) => h.id),
    };

    this.houseService.updateSection(updateSectionRequest).subscribe({
      next: (response) => {
        if (response.responseStatus === 200) {
          this.toastrService.success('Ev bölmədən uğurla silindi', 'Uğur');
          this.loadSections();
        } else {
          this.toastrService.danger('Bölmə yeniləmək alınmadı', 'Xəta');
        }
      },
      error: (err) => {
        this.toastrService.danger('Ev silmək alınmadı', 'Xəta');
        console.error('Error removing house from section:', err);
      },
    });
  }

  isHouseInSection(section: SectionDto, houseId: number): boolean {
    return section.houses.some((h) => h.id === houseId);
  }

  selectSection(section: SectionDto): void {
    this.selectedSection = section;
  }

  getPageRange(): (number | string)[] {
    const maxVisiblePages = 5;
    const totalPages = this.totalPages;
    const currentPage = this.pageNumber;

    if (totalPages <= maxVisiblePages) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    const pages: (number | string)[] = [];
    pages.push(1);

    const showEllipsisBefore = currentPage > maxVisiblePages - 1;
    const showEllipsisAfter = currentPage < totalPages - maxVisiblePages + 2;

    if (showEllipsisBefore) pages.push('...');

    const start = Math.max(2, currentPage - Math.floor(maxVisiblePages / 2));
    const end = Math.min(totalPages - 1, start + maxVisiblePages - 1);

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    if (showEllipsisAfter) pages.push('...');
    if (totalPages > 1) pages.push(totalPages);

    return pages;
  }

  onPageClick(page: number | string): void {
    if (typeof page === 'number') {
      this.changePage(page);
    }
  }
}
