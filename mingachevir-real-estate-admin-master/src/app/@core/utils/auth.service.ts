import { Observable } from 'rxjs';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {tap} from 'rxjs/operators';
import {Injectable} from '@angular/core';
import {environment} from "../../../environments/environment";

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private token: string | null = null;
  private deviceId: string = this.generateDeviceId();
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  login(username: string, password: string, deviceId: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/login`, { username, password, deviceId })
      .pipe(
        tap((response: any) => {
          this.token = response.token;
          localStorage.setItem('token', this.token);
        }),
      );
  }

  logout(): Observable<any> {
    return this.http.post(`${this.apiUrl}/auth/logout`, {})
      .pipe(
        tap(() => {
          this.token = null;
          localStorage.removeItem('token');
        }),
      );
  }

  private generateDeviceId(): string {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }
}
