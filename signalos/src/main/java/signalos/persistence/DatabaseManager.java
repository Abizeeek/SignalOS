package signalos.persistence;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.SQLException;
import java.sql.Statement;
import java.io.InputStream;
import java.util.Scanner;

public class DatabaseManager {
    private final String url;

    public DatabaseManager(String dbPath) {
        this.url = "jdbc:h2:file:./" + dbPath + ";DB_CLOSE_DELAY=-1;AUTO_SERVER=TRUE";
        initializeSchema();
    }

    public Connection getConnection() throws SQLException {
        return DriverManager.getConnection(url, "sa", "");
    }

    private void initializeSchema() {
        try (Connection conn = getConnection();
             Statement stmt = conn.createStatement()) {
            
            String schema = """
                CREATE TABLE IF NOT EXISTS users (
                    id VARCHAR(255) PRIMARY KEY,
                    username VARCHAR(255) UNIQUE NOT NULL,
                    password_hash VARCHAR(255) NOT NULL,
                    registered_at TIMESTAMP
                );

                CREATE TABLE IF NOT EXISTS tasks (
                    id IDENTITY PRIMARY KEY,
                    user_id VARCHAR(255) NOT NULL,
                    name VARCHAR(255) NOT NULL,
                    signal_type VARCHAR(50),
                    leverage_type VARCHAR(50),
                    task_nature VARCHAR(50),
                    priority INT,
                    tags VARCHAR(511),
                    completed BOOLEAN,
                    due_date VARCHAR(50),
                    due_time VARCHAR(50),
                    description TEXT
                );

                CREATE TABLE IF NOT EXISTS transactions (
                    id VARCHAR(255) PRIMARY KEY,
                    user_id VARCHAR(255) NOT NULL,
                    description VARCHAR(255),
                    amount DOUBLE,
                    type VARCHAR(50),
                    timestamp TIMESTAMP
                );

                CREATE TABLE IF NOT EXISTS sessions (
                    id IDENTITY PRIMARY KEY,
                    user_id VARCHAR(255) NOT NULL,
                    task_name VARCHAR(255),
                    start_time TIMESTAMP,
                    end_time TIMESTAMP,
                    duration_minutes INT,
                    interruption_count INT,
                    mood VARCHAR(50)
                );

                CREATE TABLE IF NOT EXISTS distractions (
                    id IDENTITY PRIMARY KEY,
                    user_id VARCHAR(255) NOT NULL,
                    source VARCHAR(255),
                    duration_minutes INT,
                    timestamp TIMESTAMP
                );

                CREATE TABLE IF NOT EXISTS calendar_events (
                    id IDENTITY PRIMARY KEY,
                    user_id VARCHAR(255) NOT NULL,
                    title VARCHAR(255) NOT NULL,
                    description TEXT,
                    event_date DATE,
                    event_time TIME,
                    created_at TIMESTAMP
                );

                CREATE TABLE IF NOT EXISTS war_sessions (
                    id VARCHAR(255) PRIMARY KEY,
                    user_id VARCHAR(255) NOT NULL,
                    session_date VARCHAR(50),
                    focus_hp INT,
                    distraction_count INT,
                    xp_earned INT,
                    boss_level VARCHAR(50),
                    war_status VARCHAR(50),
                    created_at TIMESTAMP
                );

                CREATE TABLE IF NOT EXISTS day_plans (
                    user_id VARCHAR(255) NOT NULL,
                    plan_date DATE NOT NULL,
                    mode VARCHAR(50),
                    PRIMARY KEY (user_id, plan_date)
                );
                """;
            
            stmt.execute(schema);
            System.out.println("H2 Database Schema initialized successfully.");
        } catch (SQLException e) {
            e.printStackTrace();
            throw new RuntimeException("Database initialization failed", e);
        }
    }
}
