package signalos.insight;

import signalos.domain.Severity;

public class InsightRule9_PisPositive implements InsightRule {
    @Override
    public boolean fires(signalos.scoring.DayScores scores, signalos.domain.DayPlan plan) {
        return scores.getPriorityIntegrity() > 85.0;
    }

    @Override
    public InsightResult evaluate(signalos.scoring.DayScores scores, signalos.domain.DayPlan plan) {
        return new InsightResult(Severity.POSITIVE, "High priority integrity — your intentions matched your execution today.", "Excellent alignment. Continue executing the plan.");
    }
}
