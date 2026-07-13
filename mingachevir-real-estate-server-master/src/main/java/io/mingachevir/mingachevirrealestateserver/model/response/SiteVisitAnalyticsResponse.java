package io.mingachevir.mingachevirrealestateserver.model.response;

import lombok.Data;

import java.util.List;
import java.util.Map;

@Data
public class SiteVisitAnalyticsResponse {

    private long totalUsers; // Total unique users from the first day to today
    private long oldUsers;   // Users who visited before today
    private long newUsers;   // Users who visited for the first time today

    private List<UserStats> dailyStats;

    private List<UserStats> weeklyStats;

    private List<UserStats> monthlyStats;

    private List<UserStats> yearlyStats;

    public SiteVisitAnalyticsResponse() {}

    public SiteVisitAnalyticsResponse(long totalUsers, long oldUsers, long newUsers,
                                      List<UserStats> dailyStats, List<UserStats> weeklyStats,
                                      List<UserStats> monthlyStats, List<UserStats> yearlyStats) {
        this.totalUsers = totalUsers;
        this.oldUsers = oldUsers;
        this.newUsers = newUsers;
        this.dailyStats = dailyStats;
        this.weeklyStats = weeklyStats;
        this.monthlyStats = monthlyStats;
        this.yearlyStats = yearlyStats;
    }

}
