package signalos.domain;

import java.time.LocalDate;
import java.util.Collections;
import java.util.List;

public class DayPlan {
    private final LocalDate date;
    private final List<Task> top3Priorities;
    private final ExecutionMode mode;

    public DayPlan(LocalDate date, List<Task> top3Priorities, ExecutionMode mode) {
        this.date = date;
        this.top3Priorities = top3Priorities != null ? List.copyOf(top3Priorities) : Collections.emptyList();
        this.mode = mode;
    }

    public LocalDate getDate() { return date; }
    public List<Task> getTop3Priorities() { return top3Priorities; }
    public ExecutionMode getMode() { return mode; }
}
