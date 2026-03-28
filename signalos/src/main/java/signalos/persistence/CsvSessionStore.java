package signalos.persistence;

import signalos.domain.LeverageType;
import signalos.domain.Mood;
import signalos.domain.Session;
import signalos.domain.SignalType;
import signalos.domain.Task;
import signalos.domain.TaskNature;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardOpenOption;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

public class CsvSessionStore implements SessionStore {
    private final Path filePath;

    public CsvSessionStore(String filePath) {
        this.filePath = Paths.get(filePath);
        try {
            if (!Files.exists(this.filePath.getParent())) {
                Files.createDirectories(this.filePath.getParent());
            }
            if (!Files.exists(this.filePath)) {
                Files.createFile(this.filePath);
                Files.write(this.filePath, "startTime,endTime,taskName,signalType,leverageType,taskNature,priorityLevel,tags,interruptionCount,mood\n".getBytes());
            }
        } catch (IOException e) {
            System.err.println("Could not initialize session store: " + e.getMessage());
        }
    }

    @Override
    public void save(Session session) {
        Task t = session.getTask();
        String tags = String.join(";", t.getTags());
        String line = String.format("%s,%s,%s,%s,%s,%s,%d,%s,%d,%s\n",
                session.getStartTime(), session.getEndTime(),
                t.getName(), t.getSignalType(), t.getLeverageType(), t.getTaskNature(),
                t.getPriorityLevel(), tags, session.getInterruptionCount(), session.getMood());
        try {
            Files.write(filePath, line.getBytes(), StandardOpenOption.APPEND);
        } catch (IOException e) {
            System.err.println("Failed to write to session store: " + e.getMessage());
        }
    }

    @Override
    public List<Session> loadByDate(LocalDate date) {
        return loadRange(date, date);
    }

    @Override
    public List<Session> loadRange(LocalDate from, LocalDate to) {
        try {
            List<String> lines = Files.readAllLines(filePath);
            List<Session> sessions = new ArrayList<>();
            for (int i = 1; i < lines.size(); i++) {
                String[] parts = lines.get(i).split(",");
                if (parts.length < 10) continue;
                LocalDateTime startTime = LocalDateTime.parse(parts[0]);
                LocalDate d = startTime.toLocalDate();
                if ((d.isEqual(from) || d.isAfter(from)) && (d.isEqual(to) || d.isBefore(to))) {
                    LocalDateTime endTime = LocalDateTime.parse(parts[1]);
                    String name = parts[2];
                    SignalType st = SignalType.valueOf(parts[3]);
                    LeverageType lt = LeverageType.valueOf(parts[4]);
                    TaskNature tn = TaskNature.valueOf(parts[5]);
                    int prio = Integer.parseInt(parts[6]);
                    List<String> tags = parts[7].isEmpty() ? Collections.emptyList() : List.of(parts[7].split(";"));
                    Task task = new Task(name, st, lt, tn, prio, tags);
                    
                    int interruptions = Integer.parseInt(parts[8]);
                    Mood mood = Mood.valueOf(parts[9]);
                    
                    sessions.add(new Session(task, startTime, endTime, interruptions, mood));
                }
            }
            return sessions;
        } catch (IOException e) {
            return Collections.emptyList();
        }
    }
}
