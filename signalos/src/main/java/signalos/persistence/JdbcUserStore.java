package signalos.persistence;

import signalos.domain.User;
import java.sql.*;
import java.time.LocalDateTime;
import java.util.Optional;

public class JdbcUserStore implements UserStore {
    private final DatabaseManager db;

    public JdbcUserStore(DatabaseManager db) {
        this.db = db;
    }

    @Override
    public void save(User user) {
        String sql = "MERGE INTO users (id, username, password_hash, created_at) KEY(id) VALUES (?, ?, ?, ?)";
        try (Connection conn = db.getConnection();
             PreparedStatement pstmt = conn.prepareStatement(sql)) {
            
            pstmt.setString(1, user.getId());
            pstmt.setString(2, user.getUsername());
            pstmt.setString(3, user.getPasswordHash());
            pstmt.setTimestamp(4, Timestamp.valueOf(user.getRegisteredAt()));
            pstmt.executeUpdate();
        } catch (SQLException e) {
            e.printStackTrace();
        }
    }

    @Override
    public Optional<User> findByUsername(String username) {
        String sql = "SELECT * FROM users WHERE username = ?";
        try (Connection conn = db.getConnection();
             PreparedStatement pstmt = conn.prepareStatement(sql)) {
            
            pstmt.setString(1, username);
            ResultSet rs = pstmt.executeQuery();
            if (rs.next()) {
                return Optional.of(new User(
                    rs.getString("id"),
                    rs.getString("username"),
                    rs.getString("password_hash"),
                    rs.getTimestamp("registered_at").toLocalDateTime()
                ));
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return Optional.empty();
    }

    @Override
    public Optional<User> findById(String id) {
        String sql = "SELECT * FROM users WHERE id = ?";
        try (Connection conn = db.getConnection();
             PreparedStatement pstmt = conn.prepareStatement(sql)) {
            
            pstmt.setString(1, id);
            ResultSet rs = pstmt.executeQuery();
            if (rs.next()) {
                return Optional.of(new User(
                    rs.getString("id"),
                    rs.getString("username"),
                    rs.getString("password_hash"),
                    rs.getTimestamp("registered_at").toLocalDateTime()
                ));
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return Optional.empty();
    }
}
