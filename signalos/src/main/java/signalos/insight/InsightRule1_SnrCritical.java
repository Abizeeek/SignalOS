package signalos.insight;

import signalos.domain.Severity;

public class InsightRule1_SnrCritical implements InsightRule {
    @Override
    public boolean fires(signalos.scoring.DayScores scores, signalos.domain.DayPlan plan) {
        return scores.getSnr() < 1.5;
    }

    @Override
    public InsightResult evaluate(signalos.scoring.DayScores scores, signalos.domain.DayPlan plan) {
        return new InsightResult(Severity.CRITICAL, "Signal-to-noise ratio is critical — reactive work dominated today.", "Filter noise immediately tomorrow.");
    }
}
