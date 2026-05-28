package signalos.persistence;

import signalos.domain.DistractionLog;
import java.io.*;
import java.nio.file.*;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

public class CsvDistractionStore implements DistractionStore {
    private final Path baseDir;

    public CsvDistractionStore(String baseDirStr) {
        this.baseDir = Paths.get(baseDirStr);
        try {
            if (!Files.exists(this.baseDir)) {
                Files.createDirectories(this.baseDir);
            }
        } catch (IOException e) {
            System.err.println("Could not initialize distraction store base dir: " + e.getMessage());
        }
    }

    private Path getFilePath(String userId) {
        Path userDir = baseDir.resolve(userId);
        Path file = userDir.resolve("distractions.csv");
        try {
            if (!Files.exists(file)) {
                Files.createDirectories(userDir);
                Files.createFile(file);
            }
        } catch (IOException e) {
            System.err.println("Could not initialize distraction file for user: " + e.getMessage());
        }
        return file;
    }

    @Override
    public List<DistractionLog> loadAll(String userId) {
        List<DistractionLog> distractions = new ArrayList<>();
        try (BufferedReader br = Files.newBufferedReader(getFilePath(userId))) {
            String line;
            while ((line = br.readLine()) != null) {
                if(line.trim().isEmpty()) continue;
                String[] parts = line.split(",", -1);
                if (parts.length >= 4) {
                    distractions.add(new DistractionLog(
                        parts[0],
                        parts[1],
                        Integer.parseInt(parts[2]),
                        LocalDateTime.parse(parts[3])
                    ));
                }
            }
        } catch (IOException e) {
            e.printStackTrace();
        }
        return distractions;
    }

    @Override
    public List<DistractionLog> loadByDate(String userId, LocalDate date) {
        return loadAll(userId).stream()
                .filter(d -> d.getTimestamp().toLocalDate().equals(date))
                .collect(Collectors.toList());
    }

    @Override
    public void save(String userId, DistractionLog distraction) {
        try (BufferedWriter bw = Files.newBufferedWriter(getFilePath(userId), StandardOpenOption.APPEND)) {
            bw.write(String.join(",",
                distraction.getId(),
                distraction.getSource(),
                String.valueOf(distraction.getDurationMinutes()),
                distraction.getTimestamp().toString()
            ));
            bw.newLine();
        } catch (IOException e) {
            e.printStackTrace();
        }
    }
}
