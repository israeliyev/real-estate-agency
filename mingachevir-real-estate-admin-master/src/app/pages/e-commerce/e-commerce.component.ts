import {Component, OnInit} from '@angular/core';
import {ToastrService} from 'ngx-toastr';
import {AnalyticsService} from '../../@core/utils';
import {SiteVisitAnalyticsResponse} from '../../model/SiteVisitAnalyticsResponse';
import {NbToastrService} from "@nebular/theme";

@Component({
  selector: 'ngx-ecommerce',
  templateUrl: './e-commerce.component.html',
})
export class ECommerceComponent implements OnInit {

  analytics: SiteVisitAnalyticsResponse | null = null;

  constructor(private analyticsService: AnalyticsService, private toaster: NbToastrService) {
  }

  ngOnInit(): void {
    this.loadAnalytics();
  }

  loadAnalytics(): void {
    this.analyticsService.getSiteVisitAnalytics().subscribe({
      next: (data: SiteVisitAnalyticsResponse) => {
        this.analytics = data; // data is already unwrapped by the service
      },
      error: (err: any) => {
        this.toaster.danger('İstifədəçi məlumatları yüklənərkən xəta baş verdi!', 'Xəta: Məlumatlar');
        console.error('Error loading analytics:', err);
      },
    });
  }
}
