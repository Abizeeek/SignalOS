package signalos.persistence;

import signalos.domain.DayPlan;
import signalos.domain.Task;
import java.sql.*;
import java.time.LocalDate;
import java.util.List;

public class JdbcDayPlanStore implements DayPlanStore {
    private final DatabaseManager db;
    private final TaskStore taskStore;

    public JdbcDayPlanStore(DatabaseManager db, TaskStore taskStore) {
        this.db = db;
        this.taskStore = taskStore;
    }

    @Override
    public DayPlan loadByDate(String userId, LocalDate date) {
        String sql = "SELECT * FROM day_plans WHERE user_id = ? AND plan_date = ?";
        try (Connection conn = db.getConnection();
             PreparedStatement pstmt = conn.prepareStatement(sql)) {
            
            pstmt.setString(1, userId);
            pstmt.setDate(2, Date.valueOf(date));
            ResultSet rs = pstmt.executeQuery();
            
            signalos.domain.ExecutionMode mode = signalos.domain.ExecutionMode.OPERATOR;
            if (rs.next()) {
                mode = signalos.domain.ExecutionMode.valueOf(rs.getString("mode"));
            }
            
            List<Task> tasks = taskStore.loadAll(userId).stream()
                .filter(t -> t.getDueDate() != null && t.getDueDate().equals(date.toString()))
                .limit(3)
                .toList();
                
            return new DayPlan(date, tasks, mode);
        } catch (SQLException e) {
            return new DayPlan(date, List.of(), signalos.domain.ExecutionMode.OPERATOR);
        }
    }

    @Override
    public void save(String userId, DayPlan plan) {
        String sql = "MERGE INTO day_plans (user_id, plan_date, mode) KEY(user_id, plan_date) VALUES (?, ?, ?)";
        try (Connection conn = db.getConnection();
             PreparedStatement pstmt = conn.prepareStatement(sql)) {
            
            pstmt.setString(1, userId);
            pstmt.setDate(2, Date.valueOf(plan.getDate()));
            pstmt.setString(3, plan.getMode().name());
            pstmt.executeUpdate();
            
            for (Task t : plan.getTop3Priorities()) {
                taskStore.save(userId, t);
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
    }
}
