import { Injectable } from '@angular/core';
import {environment} from "../../../environments/environment";
import {HttpClient, HttpParams} from "@angular/common/http";
import { Observable } from 'rxjs';
import { GenericResponse } from '../../model/base/GenericResponse';
import {MainCategoryDto} from "../../model/MainCategoryDto";
import {ParameterDto} from "../../model/ParameterDto";
import {ActiveCategoriesDTO} from "../../model/category/ActiveCategoriesDTO";
import {CategoryUpdateRequestDTO} from "../../model/category/CategoryUpdateRequestDTO";
import {HouseDTO} from "../../model/category/HouseDTO";
import {SubCategoryDto} from "../../model/SubCategoryDto";

@Injectable({
  providedIn: 'root'
})
export class CategoryService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {
  }

  getCategories(): Observable<GenericResponse<Array<MainCategoryDto>>> {
    return this.http.get<GenericResponse<MainCategoryDto[]>>(`${this.apiUrl}/categories`);
  }


  getParametersBySubCategoryId(subCategoryId: number): Observable<GenericResponse<Array<ParameterDto>>> {
    return this.http.get<GenericResponse<Array<ParameterDto>>>(`${this.apiUrl}/parameters/${subCategoryId}`);
  }


  getActiveCategories(): Observable<GenericResponse<ActiveCategoriesDTO>> {
    return this.http.get<GenericResponse<ActiveCategoriesDTO>>(`${this.apiUrl}/categories/active`);
  }

  getSubCategoriesWithoutMainCategory(): Observable<GenericResponse<SubCategoryDto[]>> {
    return this.http.get<GenericResponse<SubCategoryDto[]>>(`${this.apiUrl}/sub-category/without-main-category`);
  }

  checkCategoryParametersHouses(params: {
    mainCategoryIds?: number[];
    subCategoryIds?: number[];
    parameterIds?: number[];
    selectiveParameterIds?: number[];
  }): Observable<GenericResponse<number>> {
    let httpParams = new HttpParams();
    if (params.mainCategoryIds) httpParams = httpParams.set('mainCategoryIds', params.mainCategoryIds.join(','));
    if (params.subCategoryIds) httpParams = httpParams.set('subCategoryIds', params.subCategoryIds.join(','));
    if (params.parameterIds) httpParams = httpParams.set('parameterIds', params.parameterIds.join(','));
    if (params.selectiveParameterIds) httpParams =
      httpParams.set('selectiveParameterIds', params.selectiveParameterIds.join(','));
    return this.http.get<GenericResponse<number>>(`${this.apiUrl}/auth/categories/check-houses`, { params: httpParams });
  }

  updateCategories(request: CategoryUpdateRequestDTO): Observable<GenericResponse<string>> {
    return this.http.put<GenericResponse<string>>(`${this.apiUrl}/auth/categories/update`, request);
  }

  getDerelictHouses(): Observable<GenericResponse<HouseDTO[]>> {
    return this.http.get<GenericResponse<HouseDTO[]>>(`${this.apiUrl}/auth/categories/derelict-houses`);
  }
}
