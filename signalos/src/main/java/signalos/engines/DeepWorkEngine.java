package signalos.engines;

import signalos.domain.DayPlan;
import signalos.domain.LeverageType;
import signalos.domain.Session;
import signalos.domain.SignalType;

import java.util.List;

public class DeepWorkEngine {
    public static class DeepWorkResult {
        public final int deepWorkMinutes;
        public final double deepWorkIndex;
        public final int longestFocusStreak;
        public final int deepWorkSessionsCount;

        public DeepWorkResult(int deepWorkMinutes, double deepWorkIndex, int longestFocusStreak, int deepWorkSessionsCount) {
            this.deepWorkMinutes = deepWorkMinutes;
            this.deepWorkIndex = deepWorkIndex;
            this.longestFocusStreak = longestFocusStreak;
            this.deepWorkSessionsCount = deepWorkSessionsCount;
        }
    }

    public DeepWorkResult analyze(List<Session> sessions, DayPlan plan) {
        int deepMin = 0;
        int totalSignalMin = 0;
        int longestStreak = 0;
        int deepCount = 0;

        for (Session s : sessions) {
            if (s.getTask().getSignalType() == SignalType.SIGNAL) {
                totalSignalMin += s.getDurationMinutes();
            }

            boolean isDeep = s.getDurationMinutes() >= 60 &&
                    s.getInterruptionCount() <= 1 &&
                    s.getTask().getLeverageType() == LeverageType.HIGH &&
                    s.getTask().getSignalType() == SignalType.SIGNAL;

            if (isDeep) {
                deepMin += s.getDurationMinutes();
                deepCount++;
                if (s.getDurationMinutes() > longestStreak) {
                    longestStreak = s.getDurationMinutes();
                }
            }
        }

        double dwi = totalSignalMin > 0 ? ((double) deepMin / totalSignalMin) * 100.0 : 0.0;

        return new DeepWorkResult(deepMin, dwi, longestStreak, deepCount);
    }
}
