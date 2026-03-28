package signalos.insight;

import signalos.domain.DayPlan;
import signalos.scoring.DayScores;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.Comparator;
import java.util.List;

public class InsightEngine {
    private final List<InsightRule> rules = Arrays.asList(
            new InsightRule1_SnrCritical(),
            new InsightRule2_SwitchingWarning(),
            new InsightRule3_DwiWarning(),
            new InsightRule4_PisCritical(),
            new InsightRule5_LeverageWarning(),
            new InsightRule6_PrimeSignalWarning(),
            new InsightRule7_FatigueWarning(),
            new InsightRule8_DwiPositive(),
            new InsightRule9_PisPositive()
    );

    public List<InsightResult> analyze(DayScores scores, DayPlan plan) {
        List<InsightResult> results = new ArrayList<>();
        for (InsightRule rule : rules) {
            if (rule.fires(scores, plan)) {
                results.add(rule.evaluate(scores, plan));
            }
        }
        
        results.sort(Comparator.comparing(InsightResult::getSeverity));
        
        return results;
    }
}
