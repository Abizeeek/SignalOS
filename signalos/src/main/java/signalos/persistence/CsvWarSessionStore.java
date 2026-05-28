package signalos.persistence;

import signalos.domain.FocusWarSession;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardOpenOption;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

public class CsvWarSessionStore implements WarSessionStore {

    private final String baseDir;

    public CsvWarSessionStore(String baseDir) {
        this.baseDir = baseDir;
    }

    private Path getFilePath(String userId) {
        Path userDir = Paths.get(baseDir, userId);
        Path file = userDir.resolve("war_sessions.csv");
        try {
            if (!Files.exists(file)) {
                Files.createDirectories(userDir);
                Files.createFile(file);
                Files.write(file, "id,userId,sessionDate,focusHP,distractionCount,xpEarned,bossLevel,warStatus,createdAt,updatedAt\n".getBytes());
            }
        } catch (IOException e) {
            System.err.println("Could not initialize war_sessions file for user: " + e.getMessage());
        }
        return file;
    }

    @Override
    public void save(String userId, FocusWarSession session) {
        List<FocusWarSession> allSessions = findAll(userId);
        boolean updated = false;
        
        for (int i = 0; i < allSessions.size(); i++) {
            if (allSessions.get(i).getId().equals(session.getId())) {
                allSessions.set(i, session);
                updated = true;
                break;
            }
        }
        
        if (!updated) {
            allSessions.add(session);
        }
        
        rewriteFile(userId, allSessions);
    }
    
    private void rewriteFile(String userId, List<FocusWarSession> sessions) {
        try {
            Path file = getFilePath(userId);
            List<String> lines = new ArrayList<>();
            lines.add("id,userId,sessionDate,focusHP,distractionCount,xpEarned,bossLevel,warStatus,createdAt,updatedAt");
            for (FocusWarSession session : sessions) {
                String line = String.format("%s,%s,%s,%d,%d,%d,%s,%s,%s,%s",
                        session.getId(), session.getUserId(), session.getSessionDate(),
                        session.getFocusHP(), session.getDistractionCount(), session.getXpEarned(),
                        session.getBossLevel().name(), session.getWarStatus().name(),
                        session.getCreatedAt(), session.getUpdatedAt());
                lines.add(line);
            }
            Files.write(file, lines, StandardOpenOption.TRUNCATE_EXISTING, StandardOpenOption.CREATE);
        } catch (IOException e) {
            System.err.println("Error writing war sessions: " + e.getMessage());
        }
    }

    @Override
    public List<FocusWarSession> findAll(String userId) {
        Path file = getFilePath(userId);
        List<FocusWarSession> sessions = new ArrayList<>();
        try {
            List<String> lines = Files.readAllLines(file);
            if (lines.isEmpty()) return sessions;
            
            for (int i = 1; i < lines.size(); i++) {
                String line = lines.get(i);
                if (line.trim().isEmpty()) continue;
                String[] parts = line.split(",");
                if (parts.length >= 10) {
                    sessions.add(new FocusWarSession(
                        parts[0], parts[1], parts[2],
                        Integer.parseInt(parts[3]), Integer.parseInt(parts[4]), Integer.parseInt(parts[5]),
                        FocusWarSession.BossLevel.valueOf(parts[6]),
                        FocusWarSession.WarStatus.valueOf(parts[7]),
                        parts[8], parts[9]
                    ));
                }
            }
        } catch (IOException e) {
            System.err.println("Error reading war sessions: " + e.getMessage());
        }
        return sessions;
    }

    @Override
    public Optional<FocusWarSession> findActiveSession(String userId) {
        return findAll(userId).stream()
            .filter(s -> s.getWarStatus() == FocusWarSession.WarStatus.ONGOING)
            .findFirst();
    }

    @Override
    public int getTotalXP(String userId) {
        return findAll(userId).stream().mapToInt(FocusWarSession::getXpEarned).sum();
    }
}
