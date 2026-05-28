package signalos.persistence;

import signalos.domain.FocusWarSession;
import java.sql.*;
import java.util.ArrayList;
import java.util.List;

public class JdbcWarSessionStore implements WarSessionStore {
    private final DatabaseManager db;

    public JdbcWarSessionStore(DatabaseManager db) {
        this.db = db;
    }

    @Override
    public void save(String userId, FocusWarSession session) {
        String sql = "MERGE INTO war_sessions (id, user_id, session_date, focus_hp, distraction_count, xp_earned, boss_level, war_status, created_at) KEY(id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)";
        try (Connection conn = db.getConnection();
             PreparedStatement pstmt = conn.prepareStatement(sql)) {
            
            pstmt.setString(1, session.getId());
            pstmt.setString(2, userId);
            pstmt.setString(3, session.getSessionDate());
            pstmt.setInt(4, session.getFocusHP());
            pstmt.setInt(5, session.getDistractionCount());
            pstmt.setInt(6, session.getXpEarned());
            pstmt.setString(7, session.getBossLevel().name());
            pstmt.setString(8, session.getWarStatus().name());
            pstmt.setTimestamp(9, Timestamp.valueOf(java.time.LocalDateTime.now())); // simple timestamp
            pstmt.executeUpdate();
        } catch (SQLException e) {
            e.printStackTrace();
        }
    }

    @Override
    public List<FocusWarSession> findAll(String userId) {
        List<FocusWarSession> sessions = new ArrayList<>();
        String sql = "SELECT * FROM war_sessions WHERE user_id = ?";
        try (Connection conn = db.getConnection();
             PreparedStatement pstmt = conn.prepareStatement(sql)) {
            
            pstmt.setString(1, userId);
            ResultSet rs = pstmt.executeQuery();
            while (rs.next()) {
                FocusWarSession s = new FocusWarSession(userId, rs.getString("session_date"));
                // We need to set the ID since it's generated/passed
                try {
                    java.lang.reflect.Field idField = FocusWarSession.class.getDeclaredField("id");
                    idField.setAccessible(true);
                    idField.set(s, rs.getString("id"));
                } catch (Exception e) {}
                
                s.setFocusHP(rs.getInt("focus_hp"));
                s.setDistractionCount(rs.getInt("distraction_count"));
                s.setXpEarned(rs.getInt("xp_earned"));
                s.setBossLevel(FocusWarSession.BossLevel.valueOf(rs.getString("boss_level")));
                s.setWarStatus(FocusWarSession.WarStatus.valueOf(rs.getString("war_status")));
                sessions.add(s);
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return sessions;
    }

    @Override
    public int getTotalXP(String userId) {
        String sql = "SELECT SUM(xp_earned) FROM war_sessions WHERE user_id = ?";
        try (Connection conn = db.getConnection();
             PreparedStatement pstmt = conn.prepareStatement(sql)) {
            
            pstmt.setString(1, userId);
            ResultSet rs = pstmt.executeQuery();
            if (rs.next()) {
                return rs.getInt(1);
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return 0;
    }

    @Override
    public java.util.Optional<FocusWarSession> findActiveSession(String userId) {
        String sql = "SELECT * FROM war_sessions WHERE user_id = ? AND war_status = 'ONGOING' ORDER BY created_at DESC LIMIT 1";
        try (Connection conn = db.getConnection();
             PreparedStatement pstmt = conn.prepareStatement(sql)) {
            
            pstmt.setString(1, userId);
            ResultSet rs = pstmt.executeQuery();
            if (rs.next()) {
                FocusWarSession s = new FocusWarSession(userId, rs.getString("session_date"));
                try {
                    java.lang.reflect.Field idField = FocusWarSession.class.getDeclaredField("id");
                    idField.setAccessible(true);
                    idField.set(s, rs.getString("id"));
                } catch (Exception e) {}
                
                s.setFocusHP(rs.getInt("focus_hp"));
                s.setDistractionCount(rs.getInt("distraction_count"));
                s.setXpEarned(rs.getInt("xp_earned"));
                s.setBossLevel(FocusWarSession.BossLevel.valueOf(rs.getString("boss_level")));
                s.setWarStatus(FocusWarSession.WarStatus.valueOf(rs.getString("war_status")));
                return java.util.Optional.of(s);
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return java.util.Optional.empty();
    }
}
