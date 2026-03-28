package signalos.engines;

import signalos.domain.DayPlan;
import signalos.domain.Session;
import signalos.domain.Task;

import java.time.Duration;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;

public class SwitchAnalyzer {
    public static class SwitchResult {
        public final int switchCount;
        public final int focusTax;
        public final int effectiveFocusTime;
        public final int burstCount;

        public SwitchResult(int switchCount, int focusTax, int effectiveFocusTime, int burstCount) {
            this.switchCount = switchCount;
            this.focusTax = focusTax;
            this.effectiveFocusTime = effectiveFocusTime;
            this.burstCount = burstCount;
        }
    }

    public SwitchResult analyze(List<Session> rawSessions, DayPlan plan) {
        if (rawSessions == null || rawSessions.isEmpty()) {
            return new SwitchResult(0, 0, 0, 0);
        }

        List<Session> sessions = rawSessions.stream()
                .sorted(Comparator.comparing(Session::getStartTime))
                .collect(Collectors.toList());

        int switchCount = 0;
        int totalFocusMinutes = 0;
        List<Session> switches = new ArrayList<>();

        Task currentTask = null;
        for (Session s : sessions) {
            totalFocusMinutes += s.getDurationMinutes();
            if (currentTask != null && !s.getTask().getName().equals(currentTask.getName())) {
                switchCount++;
                switches.add(s);
            }
            currentTask = s.getTask();
        }

        int avgSwitchPenalty = 15;
        int focusTax = switchCount * avgSwitchPenalty;
        int effectiveFocusTime = Math.max(0, totalFocusMinutes - focusTax);

        int burstCount = 0;
        for (int i = 0; i < switches.size(); i++) {
            if (i >= 2) {
                Session s1 = switches.get(i - 2);
                Session s3 = switches.get(i);
                if (Duration.between(s1.getStartTime(), s3.getStartTime()).toMinutes() <= 30) {
                    burstCount++;
                }
            }
        }

        return new SwitchResult(switchCount, focusTax, effectiveFocusTime, burstCount);
    }
}
