import {MainCategoryDTO} from "./MainCategoryDTO";
import {SubCategoryDTO} from "./SubCategoryDTO";
import {ParametersDTO} from "./ParametersDTO";
import {SelectiveParameterValueDTO} from "./SelectiveParameterValueDTO";

export interface CategoryUpdateRequestDTO {
  mainCategoriesToUpdate: MainCategoryDTO[];
  subCategoriesToUpdate: SubCategoryDTO[];
  parametersToUpdate: ParametersDTO[];
  selectiveParametersToUpdate: SelectiveParameterValueDTO[];
  mainCategoryIdsToDelete: number[];
  subCategoryIdsToDelete: number[];
  parameterIdsToDelete: number[];
  selectiveParameterIdsToDelete: number[];
}
