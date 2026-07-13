import {BaseIdNameDto} from "./BaseIdNameDto";
import {ParameterTypeEnum} from "../util/ParameterTypeEnum";

export interface ParameterDto {
  id: number;
  code?: string;
  name?: string;
  type?: ParameterTypeEnum;
  createDate?: Date;
  updateDate?: Date;
  subCategory?: BaseIdNameDto;
  mainCategory?: BaseIdNameDto;
  selectiveParameterValues?: BaseIdNameDto[];
  inputParameterValues?: BaseIdNameDto[];
}
