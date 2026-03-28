package signalos.insight;

import signalos.domain.DayPlan;
import signalos.scoring.DayScores;

public interface InsightRule {
    boolean fires(DayScores scores, DayPlan plan);
    InsightResult evaluate(DayScores scores, DayPlan plan);
}
