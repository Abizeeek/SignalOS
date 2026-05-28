package signalos.app;

import signalos.domain.DayPlan;
import signalos.domain.Session;
import signalos.persistence.*;
import signalos.report.DailyReport;
import signalos.report.DailyReportBuilder;
import signalos.export.ExportService;
import signalos.scoring.FounderMode;
import signalos.scoring.ModeConfig;
import signalos.scoring.OperatorMode;
import signalos.scoring.MonkMode;
import signalos.api.ApiServer;

import java.time.LocalDate;
import java.util.List;

public class Main {
    public static void main(String[] args) {
        String dataDir = "data/";
        String taskPath = dataDir + "tasks.csv";
        String planPath = dataDir + "plans.csv";
        String sessionPath = dataDir + "sessions.csv";

        // Generate sample data if not exists
        java.io.File dDir = new java.io.File(dataDir);
        java.io.File[] files = dDir.listFiles();
        if (!dDir.exists() || files == null || files.length == 0) {
            SampleDataLoader.generateSampleData(dataDir);
            System.out.println("Generated sample data.");
        }

        DatabaseManager db = new DatabaseManager("./" + dataDir + "signalos");
        
        TaskStore ts = new JdbcTaskStore(db);
        DayPlanStore ps = new JdbcDayPlanStore(db, ts);
        SessionStore ss = new JdbcSessionStore(db);
        DistractionStore ds = new JdbcDistractionStore(db);
        UserStore us = new JdbcUserStore(db);
        TransactionStore trs = new JdbcTransactionStore(db);
        WarSessionStore wsStore = new JdbcWarSessionStore(db);
        EventStore es = new JdbcEventStore(db);

        LocalDate today = LocalDate.now();

        DayPlan plan = ps.loadByDate("default", today);
        List<Session> sessions = ss.loadByDate("default", today);

        if (sessions.isEmpty()) {
            System.out.println("No sessions tracked for today.");
        } else {
            ModeConfig modeConfig = switch(plan.getMode()) {
                case FOUNDER -> new FounderMode();
                case MONK -> new MonkMode();
                default -> new OperatorMode();
            };
    
            DailyReportBuilder builder = new DailyReportBuilder();
            DailyReport report = builder.build(today, sessions, plan, modeConfig);
    
            ExportService export = new ExportService();
            
            // 1. Console
            export.exportToConsole(report);
            
            // 2. CSV
            export.exportToCsv(report, dataDir + "report_export.csv");
            
            // 3. JSON
            export.exportToJson(report, dataDir + "report_export.json");
        }
        
        // 4. API Server
        signalos.api.ApiServer api = new signalos.api.ApiServer(ts, ss, ds, us, trs, wsStore, es, ps);
        api.start(8080);
    }
}
