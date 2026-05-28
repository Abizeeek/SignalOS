package signalos.persistence;

import signalos.domain.CalendarEvent;
import java.sql.*;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;

public class JdbcEventStore implements EventStore {
    private final DatabaseManager db;

    public JdbcEventStore(DatabaseManager db) {
        this.db = db;
    }

    @Override
    public List<CalendarEvent> getEvents(String userId, LocalDate date) {
        List<CalendarEvent> events = new ArrayList<>();
        String sql = "SELECT * FROM calendar_events WHERE user_id = ? AND event_date = ? ORDER BY event_time ASC";
        try (Connection conn = db.getConnection();
             PreparedStatement pstmt = conn.prepareStatement(sql)) {
            
            pstmt.setString(1, userId);
            pstmt.setDate(2, Date.valueOf(date));
            ResultSet rs = pstmt.executeQuery();
            while (rs.next()) {
                CalendarEvent event = new CalendarEvent(
                    rs.getString("user_id"),
                    rs.getString("title"),
                    rs.getString("description"),
                    rs.getDate("event_date").toLocalDate(),
                    rs.getTime("event_time").toLocalTime()
                );
                event.setId(rs.getLong("id"));
                event.setCreatedAt(rs.getTimestamp("created_at").toLocalDateTime());
                events.add(event);
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return events;
    }

    @Override
    public void addEvent(CalendarEvent event) {
        String sql = "INSERT INTO calendar_events (user_id, title, description, event_date, event_time, created_at) VALUES (?, ?, ?, ?, ?, ?)";
        try (Connection conn = db.getConnection();
             PreparedStatement pstmt = conn.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS)) {
            
            pstmt.setString(1, event.getUserId());
            pstmt.setString(2, event.getTitle());
            pstmt.setString(3, event.getDescription());
            pstmt.setDate(4, Date.valueOf(event.getEventDate()));
            pstmt.setTime(5, Time.valueOf(event.getEventTime()));
            pstmt.setTimestamp(6, Timestamp.valueOf(event.getCreatedAt()));
            pstmt.executeUpdate();
            
            ResultSet rs = pstmt.getGeneratedKeys();
            if (rs.next()) {
                event.setId(rs.getLong(1));
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
    }

    @Override
    public void deleteEvent(long id, String userId) {
        String sql = "DELETE FROM calendar_events WHERE id = ? AND user_id = ?";
        try (Connection conn = db.getConnection();
             PreparedStatement pstmt = conn.prepareStatement(sql)) {
            
            pstmt.setLong(1, id);
            pstmt.setString(2, userId);
            pstmt.executeUpdate();
        } catch (SQLException e) {
            e.printStackTrace();
        }
    }
}
