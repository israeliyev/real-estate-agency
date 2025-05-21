import {HouseImageDto} from "./HouseImageDto";
import {SelectiveParameterValueDto} from "./SelectiveParameterValueDto";
import {InputParameterValueDto} from "./InputParameterValueDto";
import {BaseActiveDto} from "./base/BaseActiveDto";
import {PriceType} from "../@core/utils/enums/PriceType";

export interface HouseDto {
  id?: number;
  name: string;
  price: number;
  priceType?: PriceType;
  description: string;
  location: string;
  coverImage?: string;
  houseVideo?: string;
  createDate?: Date;
  updateDate?: Date;
  code?: string;
  status?: boolean;
  ownerName?: string;
  ownerNumber?: string;
  notes?: string;
  mainCategory?: BaseActiveDto;
  subCategory?: BaseActiveDto;
  houseImages?: HouseImageDto[];
  selectiveParameters?: Array<SelectiveParameterValueDto>;
  inputParameters?: InputParameterValueDto[];
}
