package signalos.persistence;

import signalos.domain.Session;
import java.sql.*;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

public class JdbcSessionStore implements SessionStore {
    private final DatabaseManager db;

    public JdbcSessionStore(DatabaseManager db) {
        this.db = db;
    }

    @Override
    public List<Session> loadByDate(String userId, LocalDate date) {
        List<Session> sessions = new ArrayList<>();
        String sql = "SELECT * FROM sessions WHERE user_id = ? AND CAST(start_time AS DATE) = ?";
        try (Connection conn = db.getConnection();
             PreparedStatement pstmt = conn.prepareStatement(sql)) {
            
            pstmt.setString(1, userId);
            pstmt.setDate(2, Date.valueOf(date));
            ResultSet rs = pstmt.executeQuery();
            while (rs.next()) {
                String taskName = rs.getString("task_name");
                // We create a dummy task for now as TaskStore is separate
                signalos.domain.Task task = new signalos.domain.Task(taskName, signalos.domain.SignalType.SIGNAL, signalos.domain.LeverageType.HIGH, signalos.domain.TaskNature.BUILD, 3, List.of(), false, null, null, "");
                
                Session s = new Session(
                    task,
                    rs.getTimestamp("start_time").toLocalDateTime(),
                    rs.getTimestamp("end_time") != null ? rs.getTimestamp("end_time").toLocalDateTime() : rs.getTimestamp("start_time").toLocalDateTime(),
                    rs.getInt("interruption_count"),
                    signalos.domain.Mood.valueOf(rs.getString("mood"))
                );
                sessions.add(s);
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return sessions;
    }

    @Override
    public void save(String userId, Session session) {
        String sql = "INSERT INTO sessions (user_id, task_name, start_time, end_time, duration_minutes, interruption_count, mood) VALUES (?, ?, ?, ?, ?, ?, ?)";
        try (Connection conn = db.getConnection();
             PreparedStatement pstmt = conn.prepareStatement(sql)) {
            
            pstmt.setString(1, userId);
            pstmt.setString(2, session.getTask().getName());
            pstmt.setTimestamp(3, Timestamp.valueOf(session.getStartTime()));
            pstmt.setTimestamp(4, session.getEndTime() != null ? Timestamp.valueOf(session.getEndTime()) : null);
            pstmt.setInt(5, session.getDurationMinutes());
            pstmt.setInt(6, session.getInterruptionCount());
            pstmt.setString(7, session.getMood().name());
            pstmt.executeUpdate();
        } catch (SQLException e) {
            e.printStackTrace();
        }
    }

    @Override
    public List<Session> loadRange(String userId, LocalDate from, LocalDate to) {
        List<Session> sessions = new ArrayList<>();
        String sql = "SELECT * FROM sessions WHERE user_id = ? AND CAST(start_time AS DATE) >= ? AND CAST(start_time AS DATE) <= ?";
        try (Connection conn = db.getConnection();
             PreparedStatement pstmt = conn.prepareStatement(sql)) {
            
            pstmt.setString(1, userId);
            pstmt.setDate(2, Date.valueOf(from));
            pstmt.setDate(3, Date.valueOf(to));
            ResultSet rs = pstmt.executeQuery();
            while (rs.next()) {
                String taskName = rs.getString("task_name");
                signalos.domain.Task task = new signalos.domain.Task(taskName, signalos.domain.SignalType.SIGNAL, signalos.domain.LeverageType.HIGH, signalos.domain.TaskNature.BUILD, 3, List.of(), false, null, null, "");
                
                Session s = new Session(
                    task,
                    rs.getTimestamp("start_time").toLocalDateTime(),
                    rs.getTimestamp("end_time") != null ? rs.getTimestamp("end_time").toLocalDateTime() : rs.getTimestamp("start_time").toLocalDateTime(),
                    rs.getInt("interruption_count"),
                    signalos.domain.Mood.valueOf(rs.getString("mood"))
                );
                sessions.add(s);
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return sessions;
    }
}
