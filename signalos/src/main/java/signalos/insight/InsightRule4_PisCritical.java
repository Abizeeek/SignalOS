package signalos.insight;

import signalos.domain.Severity;

public class InsightRule4_PisCritical implements InsightRule {
    @Override
    public boolean fires(signalos.scoring.DayScores scores, signalos.domain.DayPlan plan) {
        return scores.getPriorityIntegrity() < 50.0;
    }

    @Override
    public InsightResult evaluate(signalos.scoring.DayScores scores, signalos.domain.DayPlan plan) {
        return new InsightResult(Severity.CRITICAL, "Declared priorities received less than half your effort today.", "Realign tomorrow's first block to your #1 priority.");
    }
}
