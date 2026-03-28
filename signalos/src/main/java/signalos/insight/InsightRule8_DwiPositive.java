package signalos.insight;

import signalos.domain.Severity;

public class InsightRule8_DwiPositive implements InsightRule {
    @Override
    public boolean fires(signalos.scoring.DayScores scores, signalos.domain.DayPlan plan) {
        return scores.getDeepWorkIndex() > 70.0;
    }

    @Override
    public InsightResult evaluate(signalos.scoring.DayScores scores, signalos.domain.DayPlan plan) {
        return new InsightResult(Severity.POSITIVE, "Strong deep work day — protect this pattern tomorrow.", "Review what enabled today's focus and repeat it.");
    }
}
