import {MainCategoryDto} from "./MainCategoryDto";
import {ParameterDto} from "./ParameterDto";

export interface SubCategoryDto {
  id: number;
  code: string;
  name: string;
  createDate: Date;
  updateDate: Date;
  mainCategory: MainCategoryDto;
  parameters: Array<ParameterDto>;
}
