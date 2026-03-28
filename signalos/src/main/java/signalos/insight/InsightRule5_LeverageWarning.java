package signalos.insight;

import signalos.domain.Severity;

public class InsightRule5_LeverageWarning implements InsightRule {
    @Override
    public boolean fires(signalos.scoring.DayScores scores, signalos.domain.DayPlan plan) {
        return scores.getLeverageScore() < 40.0;
    }

    @Override
    public InsightResult evaluate(signalos.scoring.DayScores scores, signalos.domain.DayPlan plan) {
        return new InsightResult(Severity.WARNING, "You spent more time maintaining than building.", "Delegate or defer low-leverage maintenance tasks tomorrow.");
    }
}
