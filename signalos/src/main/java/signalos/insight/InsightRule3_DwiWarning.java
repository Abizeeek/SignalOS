package signalos.insight;

import signalos.domain.Severity;

public class InsightRule3_DwiWarning implements InsightRule {
    @Override
    public boolean fires(signalos.scoring.DayScores scores, signalos.domain.DayPlan plan) {
        return scores.getDeepWorkIndex() < 30.0;
    }

    @Override
    public InsightResult evaluate(signalos.scoring.DayScores scores, signalos.domain.DayPlan plan) {
        return new InsightResult(Severity.WARNING, "Less than 30% of signal time was uninterrupted deep work.", "Block 90-minute deep work periods explicitly.");
    }
}
