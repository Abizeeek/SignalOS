package signalos.engines;

import signalos.domain.DayPlan;
import signalos.domain.FatigueLevel;
import signalos.domain.Session;
import signalos.domain.Task;

import java.util.Comparator;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

public class DecisionFatigueEngine {
    public static class FatigueResult {
        public final double fatigueScore;
        public final FatigueLevel classification;

        public FatigueResult(double fatigueScore, FatigueLevel classification) {
            this.fatigueScore = fatigueScore;
            this.classification = classification;
        }
    }

    public FatigueResult analyze(List<Session> rawSessions, DayPlan plan) {
        if (rawSessions == null || rawSessions.isEmpty()) {
            return new FatigueResult(0, FatigueLevel.LOW);
        }

        List<Session> sessions = rawSessions.stream()
                .sorted(Comparator.comparing(Session::getStartTime))
                .collect(Collectors.toList());

        int switchCount = 0;
        int shortSessionCount = 0;
        Set<String> domains = new HashSet<>();

        Task currentTask = null;
        for (Session s : sessions) {
            if (currentTask != null && !s.getTask().getName().equals(currentTask.getName())) {
                switchCount++;
            }
            currentTask = s.getTask();

            if (s.getDurationMinutes() < 15) {
                shortSessionCount++;
            }

            if (!s.getTask().getTags().isEmpty()) {
                domains.addAll(s.getTask().getTags());
            } else {
                domains.add(s.getTask().getName());
            }
        }

        double fatigueScore = (switchCount * 0.4) + (shortSessionCount * 0.3) + (domains.size() * 0.3);

        FatigueLevel level;
        if (fatigueScore > 70) level = FatigueLevel.HIGH;
        else if (fatigueScore >= 40) level = FatigueLevel.MEDIUM;
        else level = FatigueLevel.LOW;

        return new FatigueResult(fatigueScore, level);
    }
}
