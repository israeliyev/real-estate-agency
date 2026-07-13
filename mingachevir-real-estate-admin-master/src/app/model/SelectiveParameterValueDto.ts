import {ParameterDto} from "./ParameterDto";

export interface SelectiveParameterValueDto {
    id: number;
    name: string;
    enabled: boolean;
    createDate: Date;
    updateDate: Date;
    parameter: ParameterDto;
}
