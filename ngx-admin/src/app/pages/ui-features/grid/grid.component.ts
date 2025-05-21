import {Component, OnInit} from '@angular/core';
import {HouseViewCount} from '../../../model/HouseViewCount';
import {Page} from '../../../model/Pages';
import {AnalyticsService} from '../../../@core/utils';
import {ActivatedRoute, Router} from '@angular/router';
import {NbToastrService} from '@nebular/theme';

@Component({
  selector: 'ngx-grid',
  styleUrls: ['./grid.component.scss'],
  templateUrl: './grid.component.html',
})
export class GridComponent implements OnInit {

  housesPage: Page<HouseViewCount> | null = null;
  houses: Array<HouseViewCount> | null = null;
  currentPage: number = 0;
  pageSize: number = 20;
  error: string | null = null;
  opTitle: string | null = null;

  constructor(private houseViewService: AnalyticsService,
              private toaster: NbToastrService,
              private router: Router,
              private activatedRoute: ActivatedRoute) {
  }

  ngOnInit(): void {
    const currentPath = this.activatedRoute.snapshot.url.map(segment => segment.path).join('/');

    const WATCH: string = 'watch';
    const LIKE: string = 'like';

    if (currentPath.includes(WATCH)) {
      this.loadViewedHouses();
      this.opTitle = 'Baxış Sayı';
    } else if (currentPath.includes(LIKE)) {
      this.loadLikedHouses();
      this.opTitle = 'Bəyəni Sayı';
    }
  }

  loadViewedHouses(): void {
    this.houseViewService.getHousesByViewCount(this.currentPage, this.pageSize).subscribe({
      next: (page) => {
        this.housesPage = page;
        if (this.housesPage.content && this.housesPage.content.length > 0) {
          this.houses = this.housesPage.content;
        }
        this.error = null;
      },
      error: (err) => {
        this.toaster.danger('İzlənən Evlər Хəta', 'Evlər yüklənən zaman xəta baş verdi!');
      },
    });
  }

  loadLikedHouses(): void {
    this.houseViewService.getHousesByLikeCount(this.currentPage, this.pageSize).subscribe({
      next: (page) => {
        this.housesPage = page;
        if (this.housesPage.content && this.housesPage.content.length > 0) {
          this.houses = this.housesPage.content;
        }
        this.error = null;
      },
      error: (err) => {
        this.toaster.danger('İzlənən Evlər Хəta', 'Evlər yüklənən zaman xəta baş verdi!');
      },
    });
  }

  goToPage(page: number): void {
    if (page >= 0 && page < this.housesPage?.totalPages
    ) {
      this.currentPage = page;

      const currentPath = this.activatedRoute.snapshot.url.map(segment => segment.path).join('/');

      const WATCH: string = 'watch';
      const LIKE: string = 'like';

      if (currentPath.includes(WATCH)) {
        this.loadViewedHouses();
      } else if (currentPath.includes(LIKE)) {
        this.loadLikedHouses();
      }
    }
  }

  openHouseDetail(houseId: number): void {
    this.router.navigate(['/pages/house', houseId]);
  }

  get totalPagesArray(): number[] {
    return Array.from({length: this.housesPage?.totalPages || 0}, (_, i) => i);
  }

  goToPreviousPage(): void {
    this.goToPage(this.currentPage - 1);
  }

  goToNextPage(): void {
    this.goToPage(this.currentPage + 1);
  }
}
