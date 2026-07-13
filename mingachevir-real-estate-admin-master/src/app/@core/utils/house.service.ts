import { Injectable } from '@angular/core';
import {environment} from "../../../environments/environment";
import {HttpClient, HttpHeaders, HttpParams} from "@angular/common/http";
import {Observable} from "rxjs";
import {GenericResponse} from "../../model/base/GenericResponse";
import {SectionDto} from "../../model/SectionDto";
import {HouseCardDto} from "../../model/HouseCardDto";
import {HouseDto} from "../../model/HouseDto";
import {GetFilterHousesRequest} from "../../model/GetFilterHousesRequest";
import {BrokerDto} from "../../model/BrokerDto";
import {HouseRequestDto} from "../../model/HouseRequestDto";

@Injectable({
  providedIn: 'root',
})
export class HouseService {

  private apiUrl = environment.apiUrl;
  private headers = new HttpHeaders({ 'Content-Type': 'application/json' });

  constructor(private http: HttpClient) {
  }

  getHousesByfilter(request: GetFilterHousesRequest): Observable<GenericResponse<Array<HouseCardDto>>> {
    return this.http.post<GenericResponse<Array<HouseCardDto>>>(`${this.apiUrl}/houses`, request);
  }

  getHousesWithDetailsByfilter(request: GetFilterHousesRequest): Observable<GenericResponse<Array<HouseDto>>> {
    return this.http.post<GenericResponse<Array<HouseDto>>>(`${this.apiUrl}/houses-with-detail`, request);
  }

  getHouseRequestes(): Observable<GenericResponse<Array<HouseRequestDto>>> {
    return this.http.get<GenericResponse<Array<HouseRequestDto>>>(`${this.apiUrl}/auth/house-requests`);
  }

  getBrokerInformation(): Observable<GenericResponse<BrokerDto>> {
    return this.http.get<GenericResponse<BrokerDto>>(`${this.apiUrl}/broker-information`);
  }

  saveBrokerInformation(broker: BrokerDto): Observable<GenericResponse<BrokerDto>> {
    return this.http.post<GenericResponse<BrokerDto>>(`${this.apiUrl}/auth/broker-information`, broker);
  }

  createHouse(house: HouseDto): Observable<GenericResponse<HouseDto>> {
    return this.http.post<GenericResponse<HouseDto>>(`${this.apiUrl}/auth/house`, house, {
      headers: this.headers,
      responseType: 'json',
    });
  }

  updateHouse(house: HouseDto): Observable<GenericResponse<HouseDto>> {
    return this.http.put<GenericResponse<HouseDto>>(`${this.apiUrl}/auth/house/${house.id}`, house, {
      headers: this.headers,
      responseType: 'json',
    });
  }

  getHouseById(id: number): Observable<GenericResponse<HouseDto>> {
    return this.http.get<GenericResponse<HouseDto>>(`${this.apiUrl}/house/${id}`, {
      headers: this.headers,
      responseType: 'json',
    });
  }

  deleteHouse(houseId: number): Observable<GenericResponse<any>> {
    const params = new HttpParams().set('houseId', houseId.toString());
    return this.http.delete<GenericResponse<any>>(`${this.apiUrl}/auth/house`, { params });
  }

  deleteHouseRequest(houseRequestId: number, forSave: boolean): Observable<GenericResponse<any>> {
    return this.http.delete<GenericResponse<any>>(`${this.apiUrl}/auth/house-request/${houseRequestId}?forSave=${forSave}`);
  }

  getSectionsByPage(page: string): Observable<GenericResponse<SectionDto[]>> {
    return this.http.get<GenericResponse<SectionDto[]>>(`${this.apiUrl}/houses-section/${page}`);
  }

  createSection(request: any): Observable<GenericResponse<SectionDto>> {
    return this.http.post<GenericResponse<SectionDto>>(`${this.apiUrl}/auth/houses-section`, request);
  }

  updateSection(request: any): Observable<GenericResponse<SectionDto>> {
    return this.http.put<GenericResponse<SectionDto>>(`${this.apiUrl}/auth/houses-section`, request);
  }

  deleteSection(sectionId: number): Observable<GenericResponse<any>> {
    const params = new HttpParams().set('sectionId', sectionId.toString());
    return this.http.delete<GenericResponse<any>>(`${this.apiUrl}/auth/houses-section`, {params});
  }
}
