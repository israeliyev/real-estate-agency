export interface ParameterDto {
    id: number;
    name: string;
    code?: string;
    type: string;
    selectiveParameterValues?: { id: number; name: string }[];
    inputParameterValues?: { parameterId: number; value: string }[];
}
