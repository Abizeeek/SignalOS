package signalos.insight;

import signalos.domain.Severity;

public class InsightRule6_PrimeSignalWarning implements InsightRule {
    @Override
    public boolean fires(signalos.scoring.DayScores scores, signalos.domain.DayPlan plan) {
        // If they have a prime window but overall SNR is terrible, we assume their peak was wasted.
        return !scores.getPrimeWindows().isEmpty() && scores.getSnr() < 0.5;
    }

    @Override
    public InsightResult evaluate(signalos.scoring.DayScores scores, signalos.domain.DayPlan plan) {
        return new InsightResult(Severity.WARNING, "Your highest-energy window was spent on low-signal work.", "Protect your prime window for deep work ONLY.");
    }
}
