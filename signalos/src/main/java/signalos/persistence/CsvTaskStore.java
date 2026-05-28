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
    private final Path baseDir;

    public CsvTaskStore(String baseDirStr) {
        this.baseDir = Paths.get(baseDirStr);
        try {
            if (!Files.exists(this.baseDir)) {
                Files.createDirectories(this.baseDir);
            }
        } catch (IOException e) {
            System.err.println("Could not initialize task store base dir: " + e.getMessage());
        }
    }

    private Path getFilePath(String userId) {
        Path userDir = baseDir.resolve(userId);
        Path file = userDir.resolve("tasks.csv");
        try {
            if (!Files.exists(file)) {
                Files.createDirectories(userDir);
                Files.createFile(file);
                Files.write(file, "name,signalType,leverageType,taskNature,priorityLevel,tags,completed,dueDate,dueTime,description\n".getBytes());
            }
        } catch (IOException e) {
            System.err.println("Could not initialize task file for user: " + e.getMessage());
        }
        return file;
    }

    @Override
    public void save(String userId, Task task) {
        String tags = String.join(";", task.getTags());
        String line = String.format("%s,%s,%s,%s,%d,%s,%b,%s,%s,%s\n",
                task.getName().replace(",", ""), task.getSignalType(), task.getLeverageType(),
                task.getTaskNature(), task.getPriorityLevel(), tags, task.isCompleted(),
                task.getDueDate(), task.getDueTime(), task.getDescription().replace(",", ";").replace("\n", " "));
        try {
            Files.write(getFilePath(userId), line.getBytes(), StandardOpenOption.APPEND);
        } catch (IOException e) {
            System.err.println("Failed to write to task store: " + e.getMessage());
        }
    }

    @Override
    public List<Task> findByTag(String userId, String tag) {
        return loadAll(userId).stream()
                .filter(t -> t.getTags().contains(tag))
                .collect(Collectors.toList());
    }

    @Override
    public List<Task> findBySignalType(String userId, SignalType type) {
        return loadAll(userId).stream()
                .filter(t -> t.getSignalType() == type)
                .collect(Collectors.toList());
    }

    @Override
    public List<Task> loadAll(String userId) {
        try {
            List<String> lines = Files.readAllLines(getFilePath(userId));
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
                boolean completed = parts.length > 6 ? Boolean.parseBoolean(parts[6]) : false;
                String dueDate = parts.length > 7 ? parts[7] : "";
                String dueTime = parts.length > 8 ? parts[8] : "";
                String description = parts.length > 9 ? parts[9] : "";
                tasks.add(new Task(name, st, lt, tn, prio, tags, completed, dueDate, dueTime, description));
            }
            return tasks;
        } catch (IOException e) {
            return Collections.emptyList();
        }
    }
}
