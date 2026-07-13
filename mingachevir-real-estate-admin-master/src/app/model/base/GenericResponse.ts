import {Message} from "./Message";
import {BaseResponse} from "./BaseResponse";

export interface GenericResponse<T, K = Message> extends BaseResponse<K> {
  response?: T;
  data?: T;
  pageNumber?: number;
  pageSize?: number;
  totalPages?: number;
  totalElements?: number;
  errors?: any[];         // Optional, for error cases
  errorMessage?: string;  // Optional, for error details
  errorMessageKey?: string; // Optional, for error key
}
