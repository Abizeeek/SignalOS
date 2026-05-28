package signalos.domain;

import java.util.Collections;
import java.util.List;

public class Task {
    private final String name;
    private final SignalType signalType;
    private final LeverageType leverageType;
    private final TaskNature taskNature;
    private final int priorityLevel; // 1-5
    private final List<String> tags;
    private boolean completed;
    private final String dueDate;
    private final String dueTime;
    private final String description;

    public Task(String name, SignalType signalType, LeverageType leverageType, TaskNature taskNature, int priorityLevel, List<String> tags) {
        this(name, signalType, leverageType, taskNature, priorityLevel, tags, false, "", "", "");
    }
    
    public Task(String name, SignalType signalType, LeverageType leverageType, TaskNature taskNature, int priorityLevel, List<String> tags, boolean completed) {
        this(name, signalType, leverageType, taskNature, priorityLevel, tags, completed, "", "", "");
    }
    
    public Task(String name, SignalType signalType, LeverageType leverageType, TaskNature taskNature, int priorityLevel, List<String> tags, boolean completed, String dueDate, String dueTime, String description) {
        this.name = name;
        this.signalType = signalType;
        this.leverageType = leverageType;
        this.taskNature = taskNature;
        this.priorityLevel = priorityLevel;
        this.tags = tags != null ? List.copyOf(tags) : Collections.emptyList();
        this.completed = completed;
        this.dueDate = dueDate != null ? dueDate : "";
        this.dueTime = dueTime != null ? dueTime : "";
        this.description = description != null ? description : "";
    }

    public String getName() { return name; }
    public SignalType getSignalType() { return signalType; }
    public LeverageType getLeverageType() { return leverageType; }
    public TaskNature getTaskNature() { return taskNature; }
    public int getPriorityLevel() { return priorityLevel; }
    public List<String> getTags() { return tags; }
    public boolean isCompleted() { return completed; }
    public void setCompleted(boolean completed) { this.completed = completed; }
    public String getDueDate() { return dueDate; }
    public String getDueTime() { return dueTime; }
    public String getDescription() { return description; }
}
