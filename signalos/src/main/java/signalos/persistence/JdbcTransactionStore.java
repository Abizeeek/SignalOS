package signalos.persistence;

import signalos.domain.Transaction;
import java.sql.*;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

public class JdbcTransactionStore implements TransactionStore {
    private final DatabaseManager db;

    public JdbcTransactionStore(DatabaseManager db) {
        this.db = db;
    }

    @Override
    public List<Transaction> getTransactions(String userId) {
        List<Transaction> transactions = new ArrayList<>();
        String sql = "SELECT * FROM transactions WHERE user_id = ? ORDER BY timestamp DESC";
        try (Connection conn = db.getConnection();
             PreparedStatement pstmt = conn.prepareStatement(sql)) {
            
            pstmt.setString(1, userId);
            ResultSet rs = pstmt.executeQuery();
            while (rs.next()) {
                transactions.add(new Transaction(
                    rs.getString("id"),
                    rs.getString("description"),
                    rs.getDouble("amount"),
                    rs.getString("type"),
                    rs.getTimestamp("timestamp").toInstant()
                ));
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return transactions;
    }

    @Override
    public void addTransaction(String userId, Transaction transaction) {
        String sql = "INSERT INTO transactions (id, user_id, description, amount, type, timestamp) VALUES (?, ?, ?, ?, ?, ?)";
        try (Connection conn = db.getConnection();
             PreparedStatement pstmt = conn.prepareStatement(sql)) {
            
            pstmt.setString(1, transaction.getId());
            pstmt.setString(2, userId);
            pstmt.setString(3, transaction.getDescription());
            pstmt.setDouble(4, transaction.getAmount());
            pstmt.setString(5, transaction.getType());
            pstmt.setTimestamp(6, Timestamp.from(transaction.getTimestamp()));
            pstmt.executeUpdate();
            System.out.println("Transaction saved to SQL: " + transaction.getId());
        } catch (SQLException e) {
            e.printStackTrace();
        }
    }

    @Override
    public void deleteTransaction(String userId, String id) {
        String sql = "DELETE FROM transactions WHERE id = ? AND user_id = ?";
        try (Connection conn = db.getConnection();
             PreparedStatement pstmt = conn.prepareStatement(sql)) {
            
            pstmt.setString(1, id);
            pstmt.setString(2, userId);
            pstmt.executeUpdate();
        } catch (SQLException e) {
            e.printStackTrace();
        }
    }
}
