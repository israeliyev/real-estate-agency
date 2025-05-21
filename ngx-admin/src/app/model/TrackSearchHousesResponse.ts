import {BaseIdNameDto} from './BaseIdNameDto';
import {TrackFilterDto} from './TrackFilterDto';

export interface TrackSearchHousesResponse {
  parameters: BaseIdNameDto[];
  filters: TrackFilterDto[];
}
