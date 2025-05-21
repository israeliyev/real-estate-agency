import {Component} from '@angular/core';
import {AuthService} from "../../@core/utils/auth.service";
import {ToastrService} from "ngx-toastr";
import {NbToastrService} from "@nebular/theme";
import {Router} from "@angular/router";

@Component({
  selector: 'ngx-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent {
  username: string = '';
  password: string = '';
  private deviceId: string = this.generateDeviceId();
  loading: boolean;

  constructor(private authService: AuthService, private toaster: NbToastrService, private router: Router) {
  }

  onSubmit() {
    this.loading = true;
    this.authService.login(this.username, this.password, this.deviceId)
      .subscribe(
        () => {    this.loading = false;
          this.toaster.success('Giriş edildi', 'Ugurlu'); this.router.navigate(['/pages/users']); },
        error => { this.loading = false; this.toaster.danger(error?.error || 'Naməlum xəta baş verdi', 'Xəta'); },
      );
  }

  logout() {
    this.authService.logout()
      .subscribe(
        () => {
          this.username = '';
          this.password = '';
          this.toaster.success('Çıxış edildi', 'Ugurlu');
        },
        error => {
          this.toaster.danger(error?.error || 'Naməlum xəta baş verdi', 'Xəta');
          localStorage.removeItem('token');
          this.router.navigate(['pages/login']);
        },
      );
  }

  isLoggedIn(): boolean {
    return !!this.authService.getToken();
  }

  private generateDeviceId(): string {
    return 'device-' + Math.random().toString(36).substr(2, 9);
  }
}
