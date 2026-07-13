import {ParameterDto} from "./ParameterDto";

export interface InputParameterValueDto {
  id?: number;
  code?: string;
  value?: number;
  createDate?: Date;
  updateDate?: Date;
  parameter?: ParameterDto;
}

