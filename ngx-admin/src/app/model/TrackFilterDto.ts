import {BaseIdNameDto} from './BaseIdNameDto';

export interface TrackFilterDto {
  count: number;
  searchQuery: string;
  mainCategoryName: string;
  subCategoryName: string;
  parameterValues: BaseIdNameDto[];
}
