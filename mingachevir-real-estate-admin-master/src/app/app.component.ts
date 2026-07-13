
import { Component, OnInit } from '@angular/core';
import { SeoService } from './@core/utils/seo.service';

@Component({
  selector: 'ngx-app',
  template: '<router-outlet></router-outlet>',
})
export class AppComponent implements OnInit {

  constructor(private seoService: SeoService) {
  }

  ngOnInit(): void {
    this.seoService.trackCanonicalChanges();
  }
}
