package signalos.insight;

import signalos.domain.Severity;

public class InsightResult {
    private final Severity severity;
    private final String message;
    private final String recommendation;

    public InsightResult(Severity severity, String message, String recommendation) {
        this.severity = severity;
        this.message = message;
        this.recommendation = recommendation;
    }

    public Severity getSeverity() { return severity; }
    public String getMessage() { return message; }
    public String getRecommendation() { return recommendation; }
}
