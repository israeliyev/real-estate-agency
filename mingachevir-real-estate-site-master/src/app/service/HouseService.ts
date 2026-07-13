import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {GenericResponse} from "../base/GenericResponse";
import {environment} from "../../environments/environment";
import {BrokerDto} from "../models/BrokerDto";
import {SectionDto} from "../models/SectionDto";
import {HouseDto} from "../models/HouseDto";
import {GetFilterHousesRequest} from "../models/request/GetFilterHousesRequest";
import {HouseCardDto} from "../models/HouseCardDto";
import {HouseRequestDto} from "../models/HouseRequestDto";

@Injectable({
  providedIn: 'root'
})

export class HouseService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {
  }

  getHousesBySectionPage(page: string): Observable<GenericResponse<Array<SectionDto>>> {
    return this.http.get<GenericResponse<Array<SectionDto>>>(`${this.apiUrl}/houses-section/${page}`);
  }

  getHousesByfilter(request: GetFilterHousesRequest): Observable<GenericResponse<Array<HouseCardDto>>> {
    return this.http.post<GenericResponse<Array<HouseCardDto>>>(`${this.apiUrl}/houses`, request);
  }

  getBrokerInformation(): Observable<GenericResponse<BrokerDto>> {
    return this.http.get<GenericResponse<BrokerDto>>(`${this.apiUrl}/broker-information`);
  }

  getHouseDetail(houseId: number): Observable<GenericResponse<HouseDto>> {
    return this.http.get<GenericResponse<HouseDto>>(`${this.apiUrl}/houses/${houseId}`);
  }

  createHouseRequest(request: HouseRequestDto): Observable<GenericResponse<any>> {
    const url = `${this.apiUrl}/house-request`;
    return this.http.post<GenericResponse<any>>(url, request);
  }
}

