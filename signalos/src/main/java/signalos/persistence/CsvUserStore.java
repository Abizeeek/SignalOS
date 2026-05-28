package signalos.persistence;

import signalos.domain.User;
import java.io.*;
import java.nio.file.*;
import java.time.LocalDateTime;
import java.util.Optional;

public class CsvUserStore implements UserStore {
    private final Path filePath;

    public CsvUserStore(String directory) {
        this.filePath = Paths.get(directory, "users.csv");
        try {
            if (!Files.exists(this.filePath)) {
                Files.createDirectories(this.filePath.getParent());
                Files.createFile(this.filePath);
            }
        } catch (IOException e) {
            System.err.println("Could not create users file: " + e.getMessage());
        }
    }

    @Override
    public void save(User user) {
        try (BufferedWriter bw = Files.newBufferedWriter(filePath, StandardOpenOption.APPEND)) {
            bw.write(String.join(",",
                user.getId(),
                user.getUsername(),
                user.getPasswordHash(),
                user.getRegisteredAt().toString()
            ));
            bw.newLine();
        } catch (IOException e) {
            e.printStackTrace();
        }
    }

    @Override
    public Optional<User> findById(String id) {
        return loadAll().stream().filter(u -> u.getId().equals(id)).findFirst();
    }

    @Override
    public Optional<User> findByUsername(String username) {
        return loadAll().stream().filter(u -> u.getUsername().equals(username)).findFirst();
    }

    private java.util.List<User> loadAll() {
        java.util.List<User> users = new java.util.ArrayList<>();
        try (BufferedReader br = Files.newBufferedReader(filePath)) {
            String line;
            while ((line = br.readLine()) != null) {
                if(line.trim().isEmpty()) continue;
                String[] parts = line.split(",", -1);
                if (parts.length >= 4) {
                    users.add(new User(
                        parts[0],
                        parts[1],
                        parts[2],
                        LocalDateTime.parse(parts[3])
                    ));
                }
            }
        } catch (IOException e) {
            e.printStackTrace();
        }
        return users;
    }
}
