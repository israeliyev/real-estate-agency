import {Injectable} from '@angular/core';
import {HttpClient, HttpParams} from '@angular/common/http';
import {Observable} from 'rxjs';
import {environment} from "../../environments/environment";

@Injectable({
  providedIn: 'root'
})
export class AnalyticsService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {
  }


  trackSiteVisit(sessionId: string): Observable<void> {
    const params = new HttpParams().set('sessionId', sessionId);
    return this.http.post<void>(`${this.apiUrl}/track/site-visit`, null, {params});
  }


  trackHouseView(houseId: number, sessionId: string): Observable<void> {
    const params = new HttpParams()
      .set('houseId', houseId.toString())
      .set('sessionId', sessionId);
    return this.http.post<void>(`${this.apiUrl}/track/house-view`, null, {params});
  }


  trackBasketAddition(houseId: number, sessionId: string): Observable<void> {
    const params = new HttpParams()
      .set('houseId', houseId.toString())
      .set('sessionId', sessionId);
    return this.http.post<void>(`${this.apiUrl}/track/basket-addition`, null, {params});
  }


  trackSearchQuery(filterRequest: any, sessionId: string): Observable<void> {
    const params = new HttpParams().set('sessionId', sessionId);
    return this.http.post<void>(`${this.apiUrl}/track/search-query`, filterRequest, {params});
  }
}
