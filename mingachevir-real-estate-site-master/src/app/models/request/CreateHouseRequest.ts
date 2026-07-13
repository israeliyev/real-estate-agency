import {CreateInputParameterValueRequest} from "./CreateInputParameterValueRequest";

export interface CreateHouseRequest {
  id?: number | null;
  deletedMultipartFiles?: File[];

  requester: string;
  number: number;

  name: string | null;
  description: string | null;
  price: number | null | undefined;
  priceType: string | null | undefined;
  location: string | null | undefined;
  type: string | null;

  mainCategoryId: number | null | undefined;
  subCategoryId: number | null | undefined;

  imagesPaths?: string[] | [];
  coverImage?: string | null;

  selectiveParameterValuesIds: number[];
  inputParameterValues: CreateInputParameterValueRequest[];
}
