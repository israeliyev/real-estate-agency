import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {GenericResponse} from "../base/GenericResponse";
import {environment} from "../../environments/environment";
import {MainCategoryDto} from "../models/MainCategoryDto";
import {ParameterDto} from "../models/ParameterDto";
import {SubCategoryDto} from "../models/SubCategoryDto";

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

  getParametersValuesForFooter(): Observable<GenericResponse<Array<ParameterDto>>> {
    return this.http.get<GenericResponse<Array<ParameterDto>>>(`${this.apiUrl}/parameters-values-footer`);
  }

  getSubCategoriesWithoutMainCategory(): Observable<GenericResponse<SubCategoryDto[]>> {
    return this.http.get<GenericResponse<SubCategoryDto[]>>(`${this.apiUrl}/sub-category/without-main-category`);
  }
}
