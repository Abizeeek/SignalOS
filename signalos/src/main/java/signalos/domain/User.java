package signalos.domain;

import java.time.LocalDateTime;

public class User {
    private final String id;
    private final String username;
    private final String passwordHash;
    private final LocalDateTime registeredAt;

    public User(String id, String username, String passwordHash, LocalDateTime registeredAt) {
        this.id = id;
        this.username = username;
        this.passwordHash = passwordHash;
        this.registeredAt = registeredAt;
    }

    public String getId() { return id; }
    public String getUsername() { return username; }
    public String getPasswordHash() { return passwordHash; }
    public LocalDateTime getRegisteredAt() { return registeredAt; }
}
