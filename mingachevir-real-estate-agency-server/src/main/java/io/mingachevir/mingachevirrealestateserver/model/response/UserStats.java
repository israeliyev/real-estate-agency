package io.mingachevir.mingachevirrealestateserver.model.response;

import lombok.Data;

@Data
public class UserStats {
    private String time;       // e.g., "March 2024"
    private long userCount;     // Number of unique users in this month
    private long userChange;    // Change in user count compared to previous month
    private int changePercentage; // Percentage change
    private int deltaUp;

    public UserStats(String time, long userCount, long userChange, int changePercentage, int deltaUp) {
        this.time = time;
        this.userCount = userCount;
        this.userChange = userChange;
        this.changePercentage = changePercentage;
        this.deltaUp = deltaUp;
    }
}
