package signalos.engines;

import signalos.domain.DayPlan;
import signalos.domain.Session;
import signalos.domain.SignalType;

import java.time.LocalTime;
import java.util.ArrayList;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

public class TimeSlotAnalyzer {
    public static class TimeSlotResult {
        public final List<String> primeWindows;
        public final String noiseZone;

        public TimeSlotResult(List<String> primeWindows, String noiseZone) {
            this.primeWindows = primeWindows;
            this.noiseZone = noiseZone;
        }
    }

    public TimeSlotResult analyze(List<Session> sessions, DayPlan plan) {
        Map<String, int[]> blockStats = new HashMap<>();
        blockStats.put("Early Morning", new int[]{0, 0});
        blockStats.put("Morning", new int[]{0, 0});
        blockStats.put("Afternoon", new int[]{0, 0});
        blockStats.put("Evening", new int[]{0, 0});

        for (Session s : sessions) {
            String block = getBlock(s.getStartTime().toLocalTime());
            if (block != null) {
                int[] stats = blockStats.get(block);
                stats[1] += s.getDurationMinutes(); // total
                if (s.getTask().getSignalType() == SignalType.SIGNAL) {
                    stats[0] += s.getDurationMinutes(); // signal
                }
            }
        }

        List<Map.Entry<String, Double>> densities = new ArrayList<>();
        for (Map.Entry<String, int[]> e : blockStats.entrySet()) {
            int signal = e.getValue()[0];
            int total = e.getValue()[1];
            double density = total > 0 ? (double) signal / total : 0;
            if (total > 0) densities.add(Map.entry(e.getKey(), density));
        }

        if (densities.isEmpty()) {
            return new TimeSlotResult(Collections.emptyList(), "None");
        }

        densities.sort((a, b) -> Double.compare(b.getValue(), a.getValue()));

        List<String> primeWindows = new ArrayList<>();
        primeWindows.add(densities.get(0).getKey());
        if (densities.size() > 1 && densities.get(1).getValue() > 0.5) {
            primeWindows.add(densities.get(1).getKey());
        }

        String noiseZone = densities.get(densities.size() - 1).getKey();

        return new TimeSlotResult(primeWindows, noiseZone);
    }

    private String getBlock(LocalTime t) {
        if (!t.isBefore(LocalTime.of(5,0)) && t.isBefore(LocalTime.of(8,0))) return "Early Morning";
        if (!t.isBefore(LocalTime.of(8,0)) && t.isBefore(LocalTime.of(12,0))) return "Morning";
        if (!t.isBefore(LocalTime.of(12,0)) && t.isBefore(LocalTime.of(17,0))) return "Afternoon";
        if (!t.isBefore(LocalTime.of(17,0)) && t.isBefore(LocalTime.of(21,0))) return "Evening";
        return null;
    }
}
