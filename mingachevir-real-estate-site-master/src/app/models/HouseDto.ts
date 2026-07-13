import {BaseIdNameDto} from "./BaseIdNameDto";
import {HouseImageDto} from "./HouseImageDto";
import {SelectiveParameterValueDto} from "./SelectiveParameterValueDto";
import {InputParameterValueDto} from "./InputParameterValueDto";
import {PriceType} from "../util/PriceType";

export interface HouseDto {
  id?: number;
  name?: string;
  price?: number;
  priceType?: PriceType;
  description?: string;
  location?: string;
  coverImage?: string;
  houseVideo?: string;
  status?: boolean;
  code?: string;
  createDate?: Date;
  updateDate?: Date;
  mainCategory?: BaseIdNameDto;
  subCategory?: BaseIdNameDto;
  houseImages?: HouseImageDto[];
  selectiveParameters?: Array<SelectiveParameterValueDto>;
  inputParameters?: InputParameterValueDto[];
}
