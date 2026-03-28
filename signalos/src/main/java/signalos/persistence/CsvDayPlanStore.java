package signalos.persistence;

import signalos.domain.DayPlan;
import signalos.domain.ExecutionMode;
import signalos.domain.Task;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardOpenOption;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

public class CsvDayPlanStore implements DayPlanStore {
    private final Path filePath;
    private final TaskStore taskStore;

    public CsvDayPlanStore(String filePath, TaskStore taskStore) {
        this.filePath = Paths.get(filePath);
        this.taskStore = taskStore;
        try {
            if (!Files.exists(this.filePath.getParent())) {
                Files.createDirectories(this.filePath.getParent());
            }
            if (!Files.exists(this.filePath)) {
                Files.createFile(this.filePath);
                Files.write(this.filePath, "date,mode,topTask1,topTask2,topTask3\n".getBytes());
            }
        } catch (IOException e) {
            System.err.println("Could not initialize plan store: " + e.getMessage());
        }
    }

    @Override
    public void save(DayPlan plan) {
        List<Task> top3 = plan.getTop3Priorities();
        String t1 = top3.size() > 0 ? top3.get(0).getName() : "";
        String t2 = top3.size() > 1 ? top3.get(1).getName() : "";
        String t3 = top3.size() > 2 ? top3.get(2).getName() : "";
        
        String line = String.format("%s,%s,%s,%s,%s\n",
                plan.getDate(), plan.getMode(), t1, t2, t3);
        try {
            Files.write(filePath, line.getBytes(), StandardOpenOption.APPEND);
        } catch (IOException e) {
            System.err.println("Failed to write to plan store: " + e.getMessage());
        }
    }

    @Override
    public DayPlan loadByDate(LocalDate date) {
        try {
            List<String> lines = Files.readAllLines(filePath);
            for (int i = 1; i < lines.size(); i++) {
                String[] parts = lines.get(i).split(",");
                if (parts.length < 5) continue;
                LocalDate d = LocalDate.parse(parts[0]);
                if (d.isEqual(date)) {
                    ExecutionMode mode = ExecutionMode.valueOf(parts[1]);
                    List<Task> tops = new ArrayList<>();
                    // For simplicity, we create dummy tasks for the plan if not found.
                    // PriorityAnalyzer only checks names.
                    for (int j = 2; j <= 4; j++) {
                        if (!parts[j].isEmpty()) {
                            tops.add(new Task(parts[j], null, null, null, 1, Collections.emptyList()));
                        }
                    }
                    return new DayPlan(date, tops, mode);
                }
            }
        } catch (IOException e) {
            System.err.println("Failed to read plan store: " + e.getMessage());
        }
        return new DayPlan(date, Collections.emptyList(), ExecutionMode.OPERATOR); // default fallback
    }
}
