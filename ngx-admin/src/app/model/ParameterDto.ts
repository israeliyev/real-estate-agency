import {BaseIdNameDto} from "./BaseIdNameDto";
import {ParameterTypeEnum} from "../@core/utils/enums/ParameterTypeEnum";

export interface ParameterDto {
  id: number;
  code: string;
  name: string;
  enabled: boolean;
  type: ParameterTypeEnum;
  createDate: Date;
  updateDate: Date;
  subCategory: BaseIdNameDto;
  mainCategory: BaseIdNameDto;
  selectiveParameterValues?: Array<BaseIdNameDto>;  // Made optional
  inputParameterValues?: Array<BaseIdNameDto>;      // Made optional
}
