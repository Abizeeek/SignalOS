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

    public Task(String name, SignalType signalType, LeverageType leverageType, TaskNature taskNature, int priorityLevel, List<String> tags) {
        this.name = name;
        this.signalType = signalType;
        this.leverageType = leverageType;
        this.taskNature = taskNature;
        this.priorityLevel = priorityLevel;
        this.tags = tags != null ? List.copyOf(tags) : Collections.emptyList();
    }

    public String getName() { return name; }
    public SignalType getSignalType() { return signalType; }
    public LeverageType getLeverageType() { return leverageType; }
    public TaskNature getTaskNature() { return taskNature; }
    public int getPriorityLevel() { return priorityLevel; }
    public List<String> getTags() { return tags; }
}
