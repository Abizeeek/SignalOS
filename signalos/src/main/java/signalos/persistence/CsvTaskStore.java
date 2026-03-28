package signalos.persistence;

import signalos.domain.LeverageType;
import signalos.domain.SignalType;
import signalos.domain.Task;
import signalos.domain.TaskNature;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardOpenOption;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

public class CsvTaskStore implements TaskStore {
    private final Path filePath;

    public CsvTaskStore(String filePath) {
        this.filePath = Paths.get(filePath);
        try {
            if (!Files.exists(this.filePath.getParent())) {
                Files.createDirectories(this.filePath.getParent());
            }
            if (!Files.exists(this.filePath)) {
                Files.createFile(this.filePath);
                Files.write(this.filePath, "name,signalType,leverageType,taskNature,priorityLevel,tags\n".getBytes());
            }
        } catch (IOException e) {
            System.err.println("Could not initialize task store: " + e.getMessage());
        }
    }

    @Override
    public void save(Task task) {
        String tags = String.join(";", task.getTags());
        String line = String.format("%s,%s,%s,%s,%d,%s\n",
                task.getName(), task.getSignalType(), task.getLeverageType(),
                task.getTaskNature(), task.getPriorityLevel(), tags);
        try {
            Files.write(filePath, line.getBytes(), StandardOpenOption.APPEND);
        } catch (IOException e) {
            System.err.println("Failed to write to task store: " + e.getMessage());
        }
    }

    @Override
    public List<Task> findByTag(String tag) {
        return loadAll().stream()
                .filter(t -> t.getTags().contains(tag))
                .collect(Collectors.toList());
    }

    @Override
    public List<Task> findBySignalType(SignalType type) {
        return loadAll().stream()
                .filter(t -> t.getSignalType() == type)
                .collect(Collectors.toList());
    }

    @Override
    public List<Task> loadAll() {
        try {
            List<String> lines = Files.readAllLines(filePath);
            List<Task> tasks = new ArrayList<>();
            for (int i = 1; i < lines.size(); i++) {
                String[] parts = lines.get(i).split(",");
                if (parts.length < 6) continue;
                String name = parts[0];
                SignalType st = SignalType.valueOf(parts[1]);
                LeverageType lt = LeverageType.valueOf(parts[2]);
                TaskNature tn = TaskNature.valueOf(parts[3]);
                int prio = Integer.parseInt(parts[4]);
                List<String> tags = parts[5].isEmpty() ? Collections.emptyList() : List.of(parts[5].split(";"));
                tasks.add(new Task(name, st, lt, tn, prio, tags));
            }
            return tasks;
        } catch (IOException e) {
            return Collections.emptyList();
        }
    }
}
