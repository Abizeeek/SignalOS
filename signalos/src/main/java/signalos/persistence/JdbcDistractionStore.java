package signalos.persistence;

import signalos.domain.DistractionLog;
import java.sql.*;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

public class JdbcDistractionStore implements DistractionStore {
    private final DatabaseManager db;

    public JdbcDistractionStore(DatabaseManager db) {
        this.db = db;
    }

    @Override
    public List<DistractionLog> loadByDate(String userId, LocalDate date) {
        List<DistractionLog> logs = new ArrayList<>();
        String sql = "SELECT * FROM distractions WHERE user_id = ? AND CAST(timestamp AS DATE) = ?";
        try (Connection conn = db.getConnection();
             PreparedStatement pstmt = conn.prepareStatement(sql)) {
            
            pstmt.setString(1, userId);
            pstmt.setDate(2, Date.valueOf(date));
            ResultSet rs = pstmt.executeQuery();
            while (rs.next()) {
                DistractionLog log = new DistractionLog(
                    rs.getString("source"),
                    rs.getInt("duration_minutes"),
                    rs.getTimestamp("timestamp").toLocalDateTime()
                );
                logs.add(log);
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return logs;
    }

    @Override
    public void save(String userId, DistractionLog log) {
        String sql = "INSERT INTO distractions (user_id, source, duration_minutes, timestamp) VALUES (?, ?, ?, ?)";
        try (Connection conn = db.getConnection();
             PreparedStatement pstmt = conn.prepareStatement(sql)) {
            
            pstmt.setString(1, userId);
            pstmt.setString(2, log.getSource());
            pstmt.setInt(3, log.getDurationMinutes());
            pstmt.setTimestamp(4, Timestamp.valueOf(log.getTimestamp()));
            pstmt.executeUpdate();
        } catch (SQLException e) {
            e.printStackTrace();
        }
    }

    @Override
    public List<signalos.domain.DistractionLog> loadAll(String userId) {
        List<signalos.domain.DistractionLog> logs = new ArrayList<>();
        String sql = "SELECT * FROM distractions WHERE user_id = ?";
        try (Connection conn = db.getConnection();
             PreparedStatement pstmt = conn.prepareStatement(sql)) {
            
            pstmt.setString(1, userId);
            ResultSet rs = pstmt.executeQuery();
            while (rs.next()) {
                logs.add(new signalos.domain.DistractionLog(
                    rs.getString("id"),
                    rs.getString("source"),
                    rs.getInt("duration_minutes"),
                    rs.getTimestamp("timestamp").toLocalDateTime()
                ));
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return logs;
    }
}
