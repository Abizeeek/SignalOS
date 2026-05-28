package signalos.domain;

import java.time.LocalDateTime;
import java.util.UUID;

public class DistractionLog {
    private final String id;
    private final String source;
    private final int durationMinutes;
    private final LocalDateTime timestamp;

    public DistractionLog(String source, int durationMinutes, LocalDateTime timestamp) {
        this.id = UUID.randomUUID().toString();
        this.source = source;
        this.durationMinutes = durationMinutes;
        this.timestamp = timestamp;
    }

    public DistractionLog(String id, String source, int durationMinutes, LocalDateTime timestamp) {
        this.id = id;
        this.source = source;
        this.durationMinutes = durationMinutes;
        this.timestamp = timestamp;
    }

    public String getId() { return id; }
    public String getSource() { return source; }
    public int getDurationMinutes() { return durationMinutes; }
    public LocalDateTime getTimestamp() { return timestamp; }
}
