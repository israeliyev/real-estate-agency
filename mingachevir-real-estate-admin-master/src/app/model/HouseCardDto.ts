import {PriceType} from "../@core/utils/enums/PriceType";

export interface HouseCardDto {
  id: number;
  name: string;
  price: number | null;
  priceType: PriceType;
  location: string | null;
  coverImage: string | null;
  createDate: Date;
}
