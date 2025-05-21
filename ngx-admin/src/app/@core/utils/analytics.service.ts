import { Injectable } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { Location } from '@angular/common';
import {catchError, filter, map} from 'rxjs/operators';
import {HttpClient, HttpParams} from '@angular/common/http';
import {environment} from '../../../environments/environment';
import {Observable, throwError} from 'rxjs';
import {SiteVisitAnalyticsResponse} from '../../model/SiteVisitAnalyticsResponse';
import {Page} from '../../model/Pages';
import {HouseViewCount} from '../../model/HouseViewCount';
import {TrackSearchHousesResponse} from '../../model/TrackSearchHousesResponse';
import {GenericResponse} from '../../model/base/GenericResponse';
import {DiskSpaceInfo} from "../../model/DiskSpaceInfo";

declare const ga: any;

@Injectable()
export class AnalyticsService {
  private enabled: boolean;
  private apiUrl = environment.apiUrl;


  constructor(private location: Location, private router: Router, private http: HttpClient) {
    this.enabled = false;
  }

  getSiteVisitAnalytics(): Observable<SiteVisitAnalyticsResponse> {
    return this.http.get<GenericResponse<SiteVisitAnalyticsResponse>>(`${this.apiUrl}/auth/site-visits`).pipe(
      map(response => {
        if (response.responseStatus === 200 && response.data) {
          return response.data;
        }
        throw new Error(response.errorMessage || 'Failed to fetch site visit analytics');
      }),
    );
  }

  getHousesByViewCount(page: number, size: number): Observable<Page<HouseViewCount>> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());
    return this.http.get<GenericResponse<Page<HouseViewCount>>>(`${this.apiUrl}/auth/houses/by-view-count`, { params }).pipe(
      map(response => {
        if (response.responseStatus === 200 && response.data) {
          return response.data;
        }
        throw new Error(response.errorMessage || 'Failed to fetch houses by view count');
      }),
    );
  }

  getHousesByLikeCount(page: number, size: number): Observable<Page<HouseViewCount>> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());
    return this.http.get<GenericResponse<Page<HouseViewCount>>>(`${this.apiUrl}/auth/houses/by-like-count`, { params }).pipe(
      map(response => {
        if (response.responseStatus === 200 && response.data) {
          return response.data;
        }
        throw new Error(response.errorMessage || 'Failed to fetch houses by like count');
      }),
    );
  }

  getTrackedSearchHouses(): Observable<TrackSearchHousesResponse> {
    return this.http.get<GenericResponse<TrackSearchHousesResponse>>(`${this.apiUrl}/auth/searched-filters`).pipe(
      map(response => {
        if (response.responseStatus === 200 && response.data) {
          return response.data;
        }
        throw new Error(response.errorMessage || 'Failed to fetch tracked search houses');
      }),
    );
  }

  getDiskSpace(): Observable<GenericResponse<DiskSpaceInfo>> {
    return this.http.get<GenericResponse<DiskSpaceInfo>>(`${this.apiUrl}/auth/disk-space`);
  }
}
