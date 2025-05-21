import {Component} from '@angular/core';
import {AuthService} from "../../../@core/utils/auth.service";
import {NbToastrService} from "@nebular/theme";
import {Router} from "@angular/router";

@Component({
  selector: 'ngx-one-column-layout',
  styleUrls: ['./one-column.layout.scss'],
  template: `
    <nb-layout windowMode>
      <nb-layout-header fixed>
        <ngx-header></ngx-header>
      </nb-layout-header>

      <nb-sidebar class="menu-sidebar" tag="menu-sidebar" responsive>
        <ng-content select="nb-menu"></ng-content>
        <button (click)="logout()" *ngIf="isLoggedIn()" outline nbButton status="danger" size="small" class="w-100 mt-4">Çıxış</button>
      </nb-sidebar>

      <nb-layout-column>
        <ng-content select="router-outlet"></ng-content>
      </nb-layout-column>
    </nb-layout>
  `,
})
export class OneColumnLayoutComponent {
  constructor(private auth: AuthService, private toaster: NbToastrService, private router : Router) {
  }

  isLoggedIn(): boolean {
    return !!this.auth.getToken();
  }

  logout() {
    this.auth.logout()
      .subscribe(
        () => {
          this.toaster.success('Çıxış edildi', 'Ugurlu');
          this.router.navigate(['pages/login']);
        },
        error => {
          this.toaster.danger(error?.error || 'Naməlum xəta baş verdi', 'Xəta');
          localStorage.removeItem('token');
          this.router.navigate(['pages/login']);
        },
      );
  }
}
