package signalos.report;

import signalos.domain.DayPlan;
import signalos.domain.Session;
import signalos.domain.SignalType;
import signalos.engines.DeepWorkEngine;
import signalos.engines.TimeSlotAnalyzer;
import signalos.insight.InsightEngine;
import signalos.insight.InsightResult;
import signalos.scoring.DayScores;
import signalos.scoring.ModeConfig;
import signalos.scoring.ScoreAggregator;

import java.time.LocalDate;
import java.util.List;

public class DailyReportBuilder {
    private final ScoreAggregator aggregator = new ScoreAggregator();
    private final InsightEngine insightEngine = new InsightEngine();
    private final DeepWorkEngine deepWorkEngine = new DeepWorkEngine();
    private final TimeSlotAnalyzer timeSlotAnalyzer = new TimeSlotAnalyzer();

    public DailyReport build(LocalDate date, List<Session> sessions, DayPlan plan, ModeConfig mode) {
        DayScores scores = aggregator.aggregate(sessions, plan, mode);
        List<InsightResult> insights = insightEngine.analyze(scores, plan);

        int totalTrackedMinutes = sessions.stream().mapToInt(Session::getDurationMinutes).sum();
        int totalSignalMinutes = 0;
        int totalNoiseMinutes = 0;

        for (Session s : sessions) {
            if (s.getTask().getSignalType() == SignalType.SIGNAL) totalSignalMinutes += s.getDurationMinutes();
            if (s.getTask().getSignalType() == SignalType.NOISE) totalNoiseMinutes += s.getDurationMinutes();
        }

        DeepWorkEngine.DeepWorkResult dwr = deepWorkEngine.analyze(sessions, plan);
        TimeSlotAnalyzer.TimeSlotResult tsr = timeSlotAnalyzer.analyze(sessions, plan);

        return new DailyReport(
                date,
                mode.getMode(),
                totalTrackedMinutes,
                totalSignalMinutes,
                totalNoiseMinutes,
                scores,
                dwr.deepWorkSessionsCount,
                dwr.longestFocusStreak,
                scores.getSwitchCount(),
                scores.getFocusTax(),
                tsr.noiseZone,
                insights
        );
    }
}
