import {MainCategoryDto} from "../MainCategoryDto";
import {ParameterDto} from "../ParameterDto";

export interface CategoryParameterRequest {
  mainCategories: MainCategoryDto[];
  parameters: ParameterDto[];
}
