import {OrderEnum} from "../../util/OrderEnum";
import {InputParameterValueRequest} from "./InputParameterValueRequest";

export interface GetFilterHousesRequest {
  sort?: OrderEnum;
  searchKey?: string;
  mainCategoryId?: number;
  subCategoryId?: number;
  selectiveParameterIds?: Array<number>;
  inputParametersRanges?: Array<InputParameterValueRequest>;
  pageNumber?: number;
}
