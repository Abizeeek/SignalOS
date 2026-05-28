package signalos.persistence;

import signalos.domain.Task;
import signalos.domain.SignalType;
import signalos.domain.LeverageType;
import signalos.domain.TaskNature;
import java.sql.*;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

public class JdbcTaskStore implements TaskStore {
    private final DatabaseManager db;

    public JdbcTaskStore(DatabaseManager db) {
        this.db = db;
    }

    @Override
    public List<Task> loadAll(String userId) {
        List<Task> tasks = new ArrayList<>();
        String sql = "SELECT * FROM tasks WHERE user_id = ?";
        try (Connection conn = db.getConnection();
             PreparedStatement pstmt = conn.prepareStatement(sql)) {
            
            pstmt.setString(1, userId);
            ResultSet rs = pstmt.executeQuery();
            while (rs.next()) {
                Task task = new Task(
                    rs.getString("name"),
                    SignalType.valueOf(rs.getString("signal_type")),
                    LeverageType.valueOf(rs.getString("leverage_type")),
                    TaskNature.valueOf(rs.getString("task_nature")),
                    rs.getInt("priority"),
                    parseTags(rs.getString("tags")),
                    rs.getBoolean("completed"),
                    rs.getString("due_date"),
                    rs.getString("due_time"),
                    rs.getString("description")
                );
                tasks.add(task);
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return tasks;
    }

    @Override
    public void save(String userId, Task task) {
        // Since we don't have a unique ID in Task yet equivalent to DB ID, 
        // and current CsvTaskStore saves by user_id and name (simplified).
        // I'll use MERGE or just check if name/user_id exists.
        String sql = "MERGE INTO tasks (user_id, name, signal_type, leverage_type, task_nature, priority, tags, completed, due_date, due_time, description) KEY(user_id, name) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
        try (Connection conn = db.getConnection();
             PreparedStatement pstmt = conn.prepareStatement(sql)) {
            
            pstmt.setString(1, userId);
            pstmt.setString(2, task.getName());
            pstmt.setString(3, task.getSignalType().name());
            pstmt.setString(4, task.getLeverageType().name());
            pstmt.setString(5, task.getTaskNature().name());
            pstmt.setInt(6, task.getPriorityLevel());
            pstmt.setString(7, String.join(",", task.getTags()));
            pstmt.setBoolean(8, task.isCompleted());
            pstmt.setString(9, task.getDueDate());
            pstmt.setString(10, task.getDueTime());
            pstmt.setString(11, task.getDescription());
            pstmt.executeUpdate();
        } catch (SQLException e) {
            e.printStackTrace();
        }
    }

    @Override
    public List<Task> findByTag(String userId, String tag) {
        return loadAll(userId).stream()
            .filter(t -> t.getTags().contains(tag))
            .collect(java.util.stream.Collectors.toList());
    }

    @Override
    public List<Task> findBySignalType(String userId, SignalType type) {
        String sql = "SELECT * FROM tasks WHERE user_id = ? AND signal_type = ?";
        List<Task> tasks = new ArrayList<>();
        try (Connection conn = db.getConnection();
             PreparedStatement pstmt = conn.prepareStatement(sql)) {
            
            pstmt.setString(1, userId);
            pstmt.setString(2, type.name());
            ResultSet rs = pstmt.executeQuery();
            while (rs.next()) {
                tasks.add(new Task(
                    rs.getString("name"),
                    SignalType.valueOf(rs.getString("signal_type")),
                    signalos.domain.LeverageType.valueOf(rs.getString("leverage_type")),
                    signalos.domain.TaskNature.valueOf(rs.getString("task_nature")),
                    rs.getInt("priority"),
                    parseTags(rs.getString("tags")),
                    rs.getBoolean("completed"),
                    rs.getString("due_date"),
                    rs.getString("due_time"),
                    rs.getString("description")
                ));
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return tasks;
    }

    private List<String> parseTags(String tags) {
        if (tags == null || tags.isEmpty()) return new ArrayList<>();
        return List.of(tags.split(","));
    }
}
