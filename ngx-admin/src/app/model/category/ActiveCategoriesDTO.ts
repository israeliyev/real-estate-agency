import {MainCategoryDTO} from "./MainCategoryDTO";
import {SubCategoryDTO} from "./SubCategoryDTO";
import {ParametersDTO} from './ParametersDTO';
import {SelectiveParameterValueDTO} from './SelectiveParameterValueDTO';

export interface ActiveCategoriesDTO {
  mainCategories: MainCategoryDTO[];
  subCategories: SubCategoryDTO[];
  parameters: ParametersDTO[];
  selectiveParameters: SelectiveParameterValueDTO[];
}
