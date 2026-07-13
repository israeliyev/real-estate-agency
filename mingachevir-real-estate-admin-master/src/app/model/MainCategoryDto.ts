import {SubCategoryDto} from "./SubCategoryDto";

export interface MainCategoryDto {
    id: number;
    name: string;
    subCategories: SubCategoryDto[];
}
