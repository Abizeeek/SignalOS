package signalos.domain;

import java.time.LocalDate;
import java.time.LocalTime;
import java.time.LocalDateTime;

public class CalendarEvent {
    private long id;
    private String userId;
    private String title;
    private String description;
    private LocalDate eventDate;
    private LocalTime eventTime;
    private LocalDateTime createdAt;

    public CalendarEvent(String userId, String title, String description, LocalDate eventDate, LocalTime eventTime) {
        this.userId = userId;
        this.title = title;
        this.description = description;
        this.eventDate = eventDate;
        this.eventTime = eventTime;
        this.createdAt = LocalDateTime.now();
    }

    // Getters and Setters
    public long getId() { return id; }
    public void setId(long id) { this.id = id; }
    public String getUserId() { return userId; }
    public String getTitle() { return title; }
    public String getDescription() { return description; }
    public LocalDate getEventDate() { return eventDate; }
    public LocalTime getEventTime() { return eventTime; }
    public LocalDateTime getCreatedAt() { return createdAt; }

    public void setUserId(String userId) { this.userId = userId; }
    public void setTitle(String title) { this.title = title; }
    public void setDescription(String description) { this.description = description; }
    public void setEventDate(LocalDate eventDate) { this.eventDate = eventDate; }
    public void setEventTime(LocalTime eventTime) { this.eventTime = eventTime; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
