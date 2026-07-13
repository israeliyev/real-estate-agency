import {InputParameterValueRequest} from "./InputParameterValueRequest";
import {OrderEnum} from "./OrderEnum";

export interface GetFilterHousesRequest {
  sort?: OrderEnum;
  searchKey?: string;
  mainCategoryId?: number;
  subCategoryId?: number;
  selectiveParameterIds?: Array<number>;
  inputParametersRanges?: Array<InputParameterValueRequest>;
  pageNumber?: number;
}
