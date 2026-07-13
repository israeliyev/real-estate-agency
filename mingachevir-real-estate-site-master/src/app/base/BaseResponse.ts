import { Message } from './Message';

export interface BaseResponse<T = Message> {
  responseStatus: number;
  message?: T;
}
