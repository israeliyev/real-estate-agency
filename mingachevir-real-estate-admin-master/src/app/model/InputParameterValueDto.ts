import {ParameterDto} from "./ParameterDto";

export interface InputParameterValueDto {
    id: number;
    code: string;
    value: number;
    enabled: boolean;
    createDate: Date;
    updateDate: Date;
    parameter: ParameterDto;
}
