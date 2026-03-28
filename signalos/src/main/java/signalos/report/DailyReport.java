package signalos.report;

import signalos.domain.ExecutionMode;
import signalos.insight.InsightResult;
import signalos.scoring.DayScores;

import java.time.LocalDate;
import java.util.Collections;
import java.util.List;

public class DailyReport {
    private final LocalDate date;
    private final ExecutionMode mode;
    private final int totalTrackedMinutes;
    private final int totalSignalMinutes;
    private final int totalNoiseMinutes;
    private final DayScores scores;
    private final int deepWorkSessionsCount;
    private final int longestFocusStreak;
    private final int contextSwitches;
    private final int focusTax;
    private final String noiseZone;
    private final List<InsightResult> insights;

    public DailyReport(LocalDate date, ExecutionMode mode, int totalTrackedMinutes, 
                       int totalSignalMinutes, int totalNoiseMinutes, DayScores scores, 
                       int deepWorkSessionsCount, int longestFocusStreak, 
                       int contextSwitches, int focusTax, String noiseZone, 
                       List<InsightResult> insights) {
        this.date = date;
        this.mode = mode;
        this.totalTrackedMinutes = totalTrackedMinutes;
        this.totalSignalMinutes = totalSignalMinutes;
        this.totalNoiseMinutes = totalNoiseMinutes;
        this.scores = scores;
        this.deepWorkSessionsCount = deepWorkSessionsCount;
        this.longestFocusStreak = longestFocusStreak;
        this.contextSwitches = contextSwitches;
        this.focusTax = focusTax;
        this.noiseZone = noiseZone;
        this.insights = insights != null ? List.copyOf(insights) : Collections.emptyList();
    }

    public LocalDate getDate() { return date; }
    public ExecutionMode getMode() { return mode; }
    public int getTotalTrackedMinutes() { return totalTrackedMinutes; }
    public int getTotalSignalMinutes() { return totalSignalMinutes; }
    public int getTotalNoiseMinutes() { return totalNoiseMinutes; }
    public DayScores getScores() { return scores; }
    public int getDeepWorkSessionsCount() { return deepWorkSessionsCount; }
    public int getLongestFocusStreak() { return longestFocusStreak; }
    public int getContextSwitches() { return contextSwitches; }
    public int getFocusTax() { return focusTax; }
    public String getNoiseZone() { return noiseZone; }
    public List<InsightResult> getInsights() { return insights; }
}
