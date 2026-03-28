package signalos.insight;

import signalos.domain.Severity;

public class InsightRule2_SwitchingWarning implements InsightRule {
    @Override
    public boolean fires(signalos.scoring.DayScores scores, signalos.domain.DayPlan plan) {
        return scores.getSwitchCount() > 8;
    }

    @Override
    public InsightResult evaluate(signalos.scoring.DayScores scores, signalos.domain.DayPlan plan) {
        return new InsightResult(Severity.WARNING, "Frequent switching reduced effective focus by " + scores.getFocusTax() + " minutes.", "Batch similar tasks to reduce context switches.");
    }
}
