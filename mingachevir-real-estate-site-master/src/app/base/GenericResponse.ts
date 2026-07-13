import {Message} from "./Message";
import {BaseResponse} from "./BaseResponse";

export interface GenericResponse<T, K = Message> extends BaseResponse<K> {
  response?: T;
  data?: T;
  pageNumber?: number;
  pageSize?: number;
  totalPages?: number;
  totalElements?: number;
  distributorIds?: number[];
}
