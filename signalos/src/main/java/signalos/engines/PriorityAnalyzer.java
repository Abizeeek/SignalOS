package signalos.engines;

import signalos.domain.DayPlan;
import signalos.domain.Session;
import signalos.domain.Task;

import java.time.LocalTime;
import java.util.List;

public class PriorityAnalyzer {
    public static class PriorityResult {
        public final double priorityIntegrityScore;

        public PriorityResult(double priorityIntegrityScore) {
            this.priorityIntegrityScore = priorityIntegrityScore;
        }
    }

    public PriorityResult analyze(List<Session> sessions, DayPlan plan) {
        double pisRaw = 0;
        List<Task> top3 = plan.getTop3Priorities();

        for (Session s : sessions) {
            boolean isTopPriority = top3.stream().anyMatch(t -> t.getName().equals(s.getTask().getName()));
            if (isTopPriority) {
                double primeHourBonus = isPrime(s.getStartTime().toLocalTime()) ? 1.3 : 1.0;
                pisRaw += (s.getDurationMinutes() * primeHourBonus);
            }
        }

        double declaredPriorityMinutes = 240.0; // Default 4 hours of intention
        double pis = (pisRaw / declaredPriorityMinutes) * 100.0;
        // Clamp 0-100
        pis = Math.max(0, Math.min(100, pis));

        return new PriorityResult(pis);
    }

    private boolean isPrime(LocalTime time) {
        // Assume Prime Window is early morning / morning
        return time.isAfter(LocalTime.of(5, 0)) && time.isBefore(LocalTime.of(12, 0));
    }
}
