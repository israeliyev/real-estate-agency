import {SubCategoryDto} from "./SubCategoryDto";

export interface MainCategoryDto {
  id: number;
  code: string;
  name: string;
  createDate: Date;
  updateDate: Date;
  subCategories: Array<SubCategoryDto>;
}
