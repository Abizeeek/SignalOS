package signalos.domain;

import java.time.Duration;
import java.time.LocalDateTime;

public class Session {
    private final Task task;
    private final LocalDateTime startTime;
    private final LocalDateTime endTime;
    private final int durationMinutes;
    private final int interruptionCount;
    private final Mood mood;
    private final double focusScore;

    public Session(Task task, LocalDateTime startTime, LocalDateTime endTime, int interruptionCount, Mood mood) {
        this.task = task;
        this.startTime = startTime;
        this.endTime = endTime;
        this.interruptionCount = interruptionCount;
        this.mood = mood;
        
        long minutes = Duration.between(startTime, endTime).toMinutes();
        this.durationMinutes = Math.max(0, (int) minutes);
        
        this.focusScore = calculateFocusScore(this.durationMinutes, this.interruptionCount, this.mood);
    }

    private double calculateFocusScore(int duration, int interruptions, Mood currentMood) {
        double moodWeight = 0.75; // NEUTRAL default
        if (currentMood == Mood.FLOW) moodWeight = 1.0;
        else if (currentMood == Mood.DISTRACTED) moodWeight = 0.5;
        
        return (duration * moodWeight) / (1.0 + (interruptions * 0.15));
    }

    public Task getTask() { return task; }
    public LocalDateTime getStartTime() { return startTime; }
    public LocalDateTime getEndTime() { return endTime; }
    public int getDurationMinutes() { return durationMinutes; }
    public int getInterruptionCount() { return interruptionCount; }
    public Mood getMood() { return mood; }
    public double getFocusScore() { return focusScore; }
}
