import {UserStats} from './UserStats';


export interface SiteVisitAnalyticsResponse {
  totalUsers: number;
  oldUsers: number;
  newUsers: number;
  dailyStats: UserStats[];
  weeklyStats: UserStats[];
  monthlyStats: UserStats[];
  yearlyStats: UserStats[];
}
