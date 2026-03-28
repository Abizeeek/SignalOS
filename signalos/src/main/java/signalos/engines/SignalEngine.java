package signalos.engines;

import signalos.domain.DayPlan;
import signalos.domain.Session;
import signalos.domain.SignalType;

import java.util.List;

public class SignalEngine {
    public static class SignalResult {
        public final int totalSignalMinutes;
        public final int totalNoiseMinutes;
        public final double snr;
        public final String classification;

        public SignalResult(int signal, int noise, double snr, String classification) {
            this.totalSignalMinutes = signal;
            this.totalNoiseMinutes = noise;
            this.snr = snr;
            this.classification = classification;
        }
    }

    public SignalResult analyze(List<Session> sessions, DayPlan plan) {
        int signal = 0;
        int noise = 0;

        for (Session s : sessions) {
            if (s.getTask().getSignalType() == SignalType.SIGNAL) {
                signal += s.getDurationMinutes();
            } else if (s.getTask().getSignalType() == SignalType.NOISE) {
                noise += s.getDurationMinutes();
            }
        }

        double snr = (double) signal / Math.max(noise, 1);
        String classification;
        if (snr > 3.0) classification = "EXCELLENT";
        else if (snr >= 1.5) classification = "ACCEPTABLE";
        else classification = "CRITICAL";

        return new SignalResult(signal, noise, snr, classification);
    }
}
