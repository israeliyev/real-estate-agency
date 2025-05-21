export interface ParametersDTO {
  id?: number;
  name: string;
  code: string;
  type: 'INPUT' | 'SELECT';
  subCategoryId: number | null;
  tempId?: number;
}
