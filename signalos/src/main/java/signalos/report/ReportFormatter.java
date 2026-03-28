package signalos.report;

import signalos.insight.InsightResult;

public class ReportFormatter {
    public String formatConsoleReport(DailyReport report) {
        StringBuilder sb = new StringBuilder();
        
        sb.append("═══════════════════════════════════════════════════\n");
        sb.append(String.format("  SIGNALOS  ·  EXECUTIVE REPORT  ·  %s\n", report.getDate()));
        sb.append(String.format("  Mode: %s  |  Total tracked: %d min\n", report.getMode(), report.getTotalTrackedMinutes()));
        sb.append("═══════════════════════════════════════════════════\n\n");

        sb.append("  SIGNAL BREAKDOWN\n");
        sb.append("  ─────────────────────────────────────────────────\n");
        
        int signalPct = report.getTotalTrackedMinutes() > 0 ? (int)((report.getTotalSignalMinutes() * 100.0) / report.getTotalTrackedMinutes()) : 0;
        int noisePct = report.getTotalTrackedMinutes() > 0 ? (int)((report.getTotalNoiseMinutes() * 100.0) / report.getTotalTrackedMinutes()) : 0;
        
        sb.append(String.format("  Signal     %d min  (%d%%)\n", report.getTotalSignalMinutes(), signalPct));
        sb.append(String.format("  Noise      %d min  (%d%%)\n", report.getTotalNoiseMinutes(), noisePct));
        sb.append(String.format("  SNR        %.1f    EFT: %d min\n\n", report.getScores().getSnr(), report.getScores().getEffectiveFocusTime()));

        sb.append("  SCORES\n");
        sb.append("  ─────────────────────────────────────────────────\n");
        sb.append(String.format("  Leverage Score          %.1f / 100\n", report.getScores().getLeverageScore()));
        sb.append(String.format("  Priority Integrity      %.1f / 100\n", report.getScores().getPriorityIntegrity()));
        sb.append(String.format("  Deep Work Index         %.1f / 100\n", report.getScores().getDeepWorkIndex()));
        sb.append(String.format("  Decision Fatigue        %s\n", report.getScores().getFatigueLevel()));
        sb.append(String.format("  Fragmentation           %s\n", report.getScores().getFragmentationLevel()));
        sb.append(String.format("  Operator Score          %.1f / 100\n\n", report.getScores().getOperatorScore()));

        sb.append("  DEEP WORK\n");
        sb.append("  ─────────────────────────────────────────────────\n");
        sb.append(String.format("  Sessions: %d  |  Longest streak: %d min\n\n", report.getDeepWorkSessionsCount(), report.getLongestFocusStreak()));

        sb.append("  CONTEXT SWITCHING\n");
        sb.append("  ─────────────────────────────────────────────────\n");
        sb.append(String.format("  Switches: %d  |  Focus tax: −%d min\n\n", report.getContextSwitches(), report.getFocusTax()));

        sb.append("  PRIME HOURS\n");
        sb.append("  ─────────────────────────────────────────────────\n");
        String primeWindowsStr = String.join(", ", report.getScores().getPrimeWindows());
        sb.append(String.format("  Peak windows   %s\n", primeWindowsStr.isEmpty() ? "None" : primeWindowsStr));
        sb.append(String.format("  Noise zone     %s\n\n", report.getNoiseZone()));

        sb.append("  INSIGHTS\n");
        sb.append("  ─────────────────────────────────────────────────\n");
        
        for (InsightResult ir : report.getInsights()) {
            String icon = switch (ir.getSeverity()) {
                case CRITICAL -> "⚠";
                case WARNING -> "→";
                case POSITIVE -> "✓";
            };
            
            if (ir.getSeverity() == signalos.domain.Severity.POSITIVE) {
                sb.append(String.format("  %s  %s\n", icon, ir.getMessage()));
            } else {
                sb.append(String.format("  %s  %s  ·  %s\n", icon, ir.getMessage(), ir.getRecommendation()));
            }
        }

        sb.append("\n═══════════════════════════════════════════════════\n");
        return sb.toString();
    }
}
