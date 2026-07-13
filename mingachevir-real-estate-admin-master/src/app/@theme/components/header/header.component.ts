import {ChangeDetectorRef, Component, OnDestroy, OnInit} from '@angular/core';
import {
  NbMediaBreakpointsService, NbMenuItem,
  NbMenuService,
  NbSidebarService,
  NbThemeService,
  NbToastrService,
} from '@nebular/theme';

import {AnalyticsService, LayoutService} from '../../../@core/utils';
import {map, takeUntil} from 'rxjs/operators';
import {Subject} from 'rxjs';
import {HttpStatusCode} from "../../../model/HttpStatusCode";
import {DiskSpaceInfo} from "../../../model/DiskSpaceInfo";

@Component({
  selector: 'ngx-header',
  styleUrls: ['./header.component.scss'],
  templateUrl: './header.component.html',
})
export class HeaderComponent implements OnInit, OnDestroy {

  private destroy$: Subject<void> = new Subject<void>();
  userPictureOnly: boolean = false;
  user: { name: 'Mingəçevir Əmlak Agentliyi', picture: 'assets/images/logo.png' };

  themes = [
    {
      value: 'default',
      name: 'Açıq',
    },
    {
      value: 'dark',
      name: 'Qaranlıq',
    },
    {
      value: 'cosmic',
      name: 'Kosmik',
    },
    {
      value: 'corporate',
      name: 'Rəngli',
    },
  ];

  currentTheme = 'default';

  diskSpace: DiskSpaceInfo | null = null;
  usedSpacePercentage = 0; // Percentage of used space

  constructor(private sidebarService: NbSidebarService,
              private menuService: NbMenuService,
              private themeService: NbThemeService,
              private layoutService: LayoutService,
              private breakpointService: NbMediaBreakpointsService,
              private analyticsService: AnalyticsService,
              private cdr: ChangeDetectorRef,
              private toaster: NbToastrService) {
  }

  ngOnInit() {
    this.currentTheme = this.themeService.currentTheme;

    const {xl} = this.breakpointService.getBreakpointsMap();
    this.themeService.onMediaQueryChange()
      .pipe(
        map(([, currentBreakpoint]) => currentBreakpoint.width < xl),
        takeUntil(this.destroy$),
      )
      .subscribe((isLessThanXl: boolean) => this.userPictureOnly = isLessThanXl);

    this.themeService.onThemeChange()
      .pipe(
        map(({name}) => name),
        takeUntil(this.destroy$),
      )
      .subscribe(themeName => this.currentTheme = themeName);
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  changeTheme(themeName: string) {
    this.themeService.changeTheme(themeName);
  }

  toggleSidebar(): boolean {
    this.sidebarService.toggle(true, 'menu-sidebar');
    this.layoutService.changeLayoutSize();

    return false;
  }

  navigateHome() {
    this.menuService.navigateHome();
    return false;
  }

  loadDiskSpace(): void {
    this.analyticsService.getDiskSpace().subscribe({
      next: (response) => {
        if (response.responseStatus === HttpStatusCode.OK) {
          this.diskSpace = response?.data;
          const num = (response?.data?.usedSpace / response?.data?.totalSpace) * 100;
          this.usedSpacePercentage = Math.floor(num * 10) / 10;
          this.cdr.detectChanges();
        } else {
          console.error('Disk məlumatlarını yükləmək alınmadı', 'Xəta');
        }
      },
      error: (err) => {
        console.error('Error fetching disk space:', err);
      },
    });
  }

  getStatus(value: number): string {
    if (value > 75) return 'danger'; // High usage = danger
    else if (value > 50) return 'warning';
    else if (value > 25) return 'info';
    else return 'success';
  }

  formatBytes(bytes: number): string {
    const gb = bytes / (1024 * 1024 * 1024);
    return gb.toFixed(0) + ' Gb'; // Match the image format (e.g., "25 Gb")
  }
}
