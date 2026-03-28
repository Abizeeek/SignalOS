package signalos.engines;

import signalos.domain.DayPlan;
import signalos.domain.Session;
import signalos.domain.Task;

import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;

public class ResidueAnalyzer {
    public static class ResidueResult {
        public final double residueScore;
        public final String classification;

        public ResidueResult(double residueScore, String classification) {
            this.residueScore = residueScore;
            this.classification = classification;
        }
    }

    public ResidueResult analyze(List<Session> rawSessions, DayPlan plan) {
        if (rawSessions == null || rawSessions.isEmpty()) {
            return new ResidueResult(0, "LOW");
        }

        List<Session> sessions = rawSessions.stream()
                .sorted(Comparator.comparing(Session::getStartTime))
                .collect(Collectors.toList());

        double residueScore = 0;
        int switchPenalty = 15;

        Task currentTask = null;
        for (Session s : sessions) {
            if (currentTask != null && !s.getTask().getName().equals(currentTask.getName())) {
                // switched away from currentTask
                double weight = getWeight(currentTask.getPriorityLevel());
                residueScore += (switchPenalty * weight);
            }
            currentTask = s.getTask();
        }

        String classification;
        if (residueScore >= 70) classification = "HIGH";
        else if (residueScore >= 30) classification = "MEDIUM";
        else classification = "LOW";

        return new ResidueResult(residueScore, classification);
    }

    private double getWeight(int priorityLevel) {
        // Assume 1 is HIGHEST, 5 is LOWEST, or vice-versa? 
        // Spec says: High priority -> 1.5, Medium -> 1.0, Low -> 0.5. Let's assume 1 and 2 are High, 3 is Med, 4-5 are Low.
        if (priorityLevel <= 2) return 1.5;
        if (priorityLevel == 3) return 1.0;
        return 0.5;
    }
}
