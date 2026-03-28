package signalos.api;

import io.javalin.Javalin;
import signalos.domain.Task;
import signalos.domain.Session;
import signalos.persistence.TaskStore;
import signalos.persistence.SessionStore;
import com.google.gson.Gson;
import java.time.LocalDate;
import java.util.Map;
import java.util.List;

public class ApiServer {
    private final TaskStore taskStore;
    private final SessionStore sessionStore;
    private final Gson gson = new Gson();

    public ApiServer(TaskStore taskStore, SessionStore sessionStore) {
        this.taskStore = taskStore;
        this.sessionStore = sessionStore;
    }

    public void start(int port) {
        Javalin app = Javalin.create(config -> {
            config.bundledPlugins.enableCors(cors -> {
                cors.addRule(it -> {
                    it.anyHost();
                });
            });
        }).start(port);

        // Tasks API GET (Map Java Task to React Task)
        app.get("/api/tasks", ctx -> {
            List<Map<String, Object>> reactTasks = taskStore.loadAll().stream().map(t -> {
                Map<String, Object> map = new java.util.HashMap<>();
                map.put("id", "t-" + t.getName().hashCode());
                map.put("name", t.getName());
                map.put("category", "General");
                map.put("signalType", t.getSignalType().name());
                map.put("leverageType", t.getLeverageType().name());
                map.put("taskNature", t.getTaskNature().name());
                map.put("priority", "NORMAL");
                map.put("tags", t.getTags());
                map.put("estimatedDuration", 60);
                map.put("completed", false);
                map.put("order", 0);
                return map;
            }).toList();
            ctx.json(reactTasks);
        });

        // Tasks API POST (Map React Task back to Java Task)
        app.post("/api/tasks", ctx -> {
            try {
                @SuppressWarnings("unchecked")
                Map<String, Object> req = gson.fromJson(ctx.body(), Map.class);
                String name = (String) req.getOrDefault("name", "Unnamed");
                signalos.domain.SignalType st = signalos.domain.SignalType.valueOf((String) req.getOrDefault("signalType", "SIGNAL"));
                signalos.domain.LeverageType lt = signalos.domain.LeverageType.valueOf((String) req.getOrDefault("leverageType", "HIGH"));
                signalos.domain.TaskNature tn = signalos.domain.TaskNature.valueOf((String) req.getOrDefault("taskNature", "DEEP_WORK"));
                
                Task newTask = new Task(name, st, lt, tn, 3, List.of());
                taskStore.save(newTask);
                
                ctx.status(201).result("Success");
            } catch(Exception e) {
                e.printStackTrace();
                ctx.status(500).result(e.getMessage());
            }
        });

        // Sessions API
        app.get("/api/sessions", ctx -> {
            ctx.json(sessionStore.loadByDate(LocalDate.now()));
        });

        // KPIs API (return basic mock mapping frontend for now to prove backend connection)
        app.get("/api/kpis", ctx -> {
            ctx.json(Map.of(
                "snr", 4.2,
                "leverageScore", 85,
                "priorityIntegrity", 92,
                "deepWorkIndex", 78,
                "effectiveFocusTime", 4.5,
                "attentionResidue", 12,
                "decisionFatigue", 45
            ));
        });

        // Insights API
        app.get("/api/insights", ctx -> {
            ctx.json(List.of(
                Map.of("id", "i1", "message", "Live from Java Backend: Best signal window is 9:30 AM", "severity", "SUCCESS", "type", "SCHEDULE_OPTIMIZATION"),
                Map.of("id", "i2", "message", "Live from Java Backend: Switched tasks too often", "severity", "WARNING", "type", "FOCUS_QUALITY")
            ));
        });

        System.out.println("API Server started on port " + port);
    }
}
