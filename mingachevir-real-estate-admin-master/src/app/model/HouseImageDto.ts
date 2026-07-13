import {BaseIdNameDto} from "./BaseIdNameDto";

export interface HouseImageDto {
    id: number | null;
    path: string | null;
    fileName: string | null;
    createDate: Date | null;
    updateDate: Date | null;
    house: BaseIdNameDto | null;
}
