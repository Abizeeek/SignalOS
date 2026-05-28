package signalos.app;

import signalos.domain.DayPlan;
import signalos.domain.ExecutionMode;
import signalos.domain.LeverageType;
import signalos.domain.Mood;
import signalos.domain.Session;
import signalos.domain.SignalType;
import signalos.domain.Task;
import signalos.domain.TaskNature;
import signalos.persistence.CsvDayPlanStore;
import signalos.persistence.CsvSessionStore;
import signalos.persistence.CsvTaskStore;
import signalos.persistence.DayPlanStore;
import signalos.persistence.SessionStore;
import signalos.persistence.TaskStore;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;

public class SampleDataLoader {
    
    public static void generateSampleData(String dataDir) {
        TaskStore ts = new CsvTaskStore(dataDir);
        DayPlanStore ps = new CsvDayPlanStore(dataDir, ts);
        SessionStore ss = new CsvSessionStore(dataDir);

        LocalDate today = LocalDate.now();
        
        Task t1 = new Task("Deep Architecture Work", SignalType.SIGNAL, LeverageType.HIGH, TaskNature.BUILD, 1, Arrays.asList("arch", "core"));
        Task t2 = new Task("Email Triage", SignalType.NOISE, LeverageType.LOW, TaskNature.MAINTAIN, 4, Arrays.asList("comm"));
        Task t3 = new Task("Code Review", SignalType.SIGNAL, LeverageType.MEDIUM, TaskNature.MAINTAIN, 2, Arrays.asList("team"));
        Task t4 = new Task("Standup", SignalType.NEUTRAL, LeverageType.LOW, TaskNature.MAINTAIN, 3, Arrays.asList("team"));
        Task t5 = new Task("Strategic Planning", SignalType.SIGNAL, LeverageType.HIGH, TaskNature.BUILD, 1, Arrays.asList("strategy"));
        Task t6 = new Task("Social Media Scrolling", SignalType.NOISE, LeverageType.LOW, TaskNature.WASTE, 5, Arrays.asList("waste"));
        
        ts.save("default", t1); ts.save("default", t2); ts.save("default", t3); ts.save("default", t4); ts.save("default", t5);

        DayPlan plan = new DayPlan(today, Arrays.asList(t1, t5, t3), ExecutionMode.OPERATOR);
        ps.save("default", plan);

        // Morning block
        ss.save("default", new Session(t2, LocalDateTime.of(today, java.time.LocalTime.of(8, 0)), LocalDateTime.of(today, java.time.LocalTime.of(8, 20)), 1, Mood.DISTRACTED)); // 20m noise
        ss.save("default", new Session(t1, LocalDateTime.of(today, java.time.LocalTime.of(8, 30)), LocalDateTime.of(today, java.time.LocalTime.of(10, 0)), 0, Mood.FLOW)); // 90m deep
        
        // Mid day
        ss.save("default", new Session(t4, LocalDateTime.of(today, java.time.LocalTime.of(10, 15)), LocalDateTime.of(today, java.time.LocalTime.of(10, 45)), 0, Mood.NEUTRAL)); // 30m neutral
        ss.save("default", new Session(t3, LocalDateTime.of(today, java.time.LocalTime.of(11, 0)), LocalDateTime.of(today, java.time.LocalTime.of(12, 0)), 2, Mood.NEUTRAL)); // 60m med signal
        
        // Afternoon block
        ss.save("default", new Session(t2, LocalDateTime.of(today, java.time.LocalTime.of(13, 0)), LocalDateTime.of(today, java.time.LocalTime.of(13, 30)), 3, Mood.DISTRACTED)); // 30m noise
        ss.save("default", new Session(t6, LocalDateTime.of(today, java.time.LocalTime.of(13, 30)), LocalDateTime.of(today, java.time.LocalTime.of(14, 0)), 0, Mood.DISTRACTED)); // 30m waste
        ss.save("default", new Session(t5, LocalDateTime.of(today, java.time.LocalTime.of(14, 15)), LocalDateTime.of(today, java.time.LocalTime.of(16, 15)), 1, Mood.FLOW)); // 120m deep signal
    }
}
