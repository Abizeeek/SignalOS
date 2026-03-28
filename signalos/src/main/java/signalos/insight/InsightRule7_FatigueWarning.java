package signalos.insight;

import signalos.domain.Severity;
import signalos.domain.FatigueLevel;

public class InsightRule7_FatigueWarning implements InsightRule {
    @Override
    public boolean fires(signalos.scoring.DayScores scores, signalos.domain.DayPlan plan) {
        return scores.getFatigueLevel() == FatigueLevel.HIGH;
    }

    @Override
    public InsightResult evaluate(signalos.scoring.DayScores scores, signalos.domain.DayPlan plan) {
        return new InsightResult(Severity.WARNING, "Decision fatigue likely distorted your afternoon choices — defer strategic decisions.", "Shut down the system and rest.");
    }
}
