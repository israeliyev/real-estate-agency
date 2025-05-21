import {BaseIdNameDto} from "./BaseIdNameDto";
import {HouseImageDto} from "./HouseImageDto";
import {SelectiveParameterValueDto} from "./SelectiveParameterValueDto";
import {InputParameterValueDto} from "./InputParameterValueDto";
import {PriceType} from "../@core/utils/enums/PriceType";

export interface HouseRequestDto {
    id: number;
    requester: string;
    price: number;
    priceType: PriceType;
    location: string;
    number: string;
    coverImage: string;
    createDate: Date;
    mainCategory: BaseIdNameDto;
    subCategory: BaseIdNameDto;
    houseImages: HouseImageDto[];
    selectiveParameters: Array<SelectiveParameterValueDto>;
    inputParameters: InputParameterValueDto[];
}

