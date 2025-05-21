export interface SubCategoryDTO {
  id?: number;
  name: string;
  code: string;
  mainCategoryId: number | null;
  tempId?: number;
}
