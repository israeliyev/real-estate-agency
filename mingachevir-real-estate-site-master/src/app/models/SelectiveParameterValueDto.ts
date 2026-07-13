import {ParameterDto} from "./ParameterDto";

export interface SelectiveParameterValueDto {
  id: number;
  name: string;
  createDate: Date;
  updateDate: Date;
  parameter?: ParameterDto | undefined;
}
