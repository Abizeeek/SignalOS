package signalos.engines;

import signalos.domain.DayPlan;
import signalos.domain.LeverageType;
import signalos.domain.Session;
import signalos.scoring.ModeConfig;

import java.util.List;

public class LeverageEngine {
    public static class LeverageResult {
        public final double rawScore;
        public final double penalty;
        public final double leverageScore;

        public LeverageResult(double rawScore, double penalty, double leverageScore) {
            this.rawScore = rawScore;
            this.penalty = penalty;
            this.leverageScore = leverageScore;
        }
    }

    public LeverageResult analyze(List<Session> sessions, DayPlan plan, ModeConfig modeConfig) {
        int highMin = 0;
        int medMin = 0;
        int lowMin = 0;
        int totalMinutes = 0;

        for (Session s : sessions) {
            int dur = s.getDurationMinutes();
            totalMinutes += dur;
            LeverageType lt = s.getTask().getLeverageType();
            if (lt == LeverageType.HIGH) highMin += dur;
            else if (lt == LeverageType.MEDIUM) medMin += dur;
            else if (lt == LeverageType.LOW) lowMin += dur;
        }

        if (totalMinutes == 0) return new LeverageResult(0, 0, 0);

        double rawScore = ((highMin * 3.0) + (medMin * 1.5) + (lowMin * 0.5)) / totalMinutes * 100.0;
        double penalty = lowMin * 0.8 * modeConfig.getLowLeveragePenaltyMultiplier();
        double leverageScore = Math.max(0.0, Math.min(100.0, rawScore - penalty));

        return new LeverageResult(rawScore, penalty, leverageScore);
    }
}
