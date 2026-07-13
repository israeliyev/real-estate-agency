import {HouseCardDto} from "./HouseCardDto";

export interface SectionDto {
  id: number;
  name: string;
  page: string;
  createDate: Date;
  updateDate: Date;
  houses: Array<HouseCardDto>;
}
