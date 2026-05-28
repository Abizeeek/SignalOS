package signalos.api;

import io.javalin.Javalin;
import signalos.domain.Task;
import signalos.domain.Session;
import signalos.domain.DistractionLog;
import signalos.domain.Transaction;
import signalos.persistence.DistractionStore;
import signalos.persistence.TaskStore;
import signalos.persistence.SessionStore;
import signalos.persistence.TransactionStore;
import signalos.persistence.UserStore;
import signalos.domain.User;
import signalos.persistence.WarSessionStore;
import signalos.persistence.EventStore;
import signalos.domain.FocusWarSession;
import com.google.gson.Gson;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Map;
import java.util.List;
import io.javalin.json.JsonMapper;
import java.lang.reflect.Type;
import signalos.persistence.DayPlanStore;
import signalos.domain.DayPlan;
import signalos.scoring.ScoreAggregator;
import signalos.scoring.DayScores;
import signalos.scoring.ModeConfig;
import signalos.scoring.FounderMode;
import signalos.scoring.MonkMode;
import signalos.scoring.OperatorMode;
import signalos.engines.ResidueAnalyzer;
import signalos.engines.DecisionFatigueEngine;
import signalos.insight.InsightEngine;
import signalos.insight.InsightResult;

public class ApiServer {
    private final TaskStore taskStore;
    private final SessionStore sessionStore;
    private final DistractionStore distractionStore;
    private final UserStore userStore;
    private final TransactionStore transactionStore;
    private final WarSessionStore warStore;
    private final EventStore eventStore;
    private final DayPlanStore dayPlanStore;
    private final Gson gson = new Gson();

    public ApiServer(TaskStore taskStore, SessionStore sessionStore, DistractionStore distractionStore, UserStore userStore, TransactionStore transactionStore, WarSessionStore warStore, EventStore eventStore, DayPlanStore dayPlanStore) {
        this.taskStore = taskStore;
        this.sessionStore = sessionStore;
        this.distractionStore = distractionStore;
        this.userStore = userStore;
        this.transactionStore = transactionStore;
        this.warStore = warStore;
        this.eventStore = eventStore;
        this.dayPlanStore = dayPlanStore;
    }

    private String getUserId(io.javalin.http.Context ctx) {
        String userId = ctx.header("X-User-Id");
        return userId == null ? "default" : userId;
    }

    public void start(int port) {
        Javalin app = Javalin.create(config -> {
            config.jsonMapper(new JsonMapper() {
                @Override
                public String toJsonString(Object obj, Type type) {
                    return gson.toJson(obj);
                }
                @Override
                public <T> T fromJsonString(String json, Type targetType) {
                    return gson.fromJson(json, targetType);
                }
            });
            config.bundledPlugins.enableCors(cors -> {
                cors.addRule(it -> {
                    it.anyHost();
                });
            });
        }).start(port);

        // Tasks API GET (Map Java Task to React Task)
        app.get("/api/tasks", ctx -> {
            String userId = getUserId(ctx);
            List<Map<String, Object>> reactTasks = taskStore.loadAll(userId).stream().map(t -> {
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
                map.put("completed", t.isCompleted());
                map.put("dueDate", t.getDueDate());
                map.put("dueTime", t.getDueTime());
                map.put("description", t.getDescription());
                map.put("order", 0);
                return map;
            }).toList();
            ctx.json(reactTasks);
        });

        // Tasks API POST (Map React Task back to Java Task)
        app.post("/api/tasks", ctx -> {
            try {
                String userId = getUserId(ctx);
                @SuppressWarnings("unchecked")
                Map<String, Object> req = gson.fromJson(ctx.body(), Map.class);
                String name = (String) req.getOrDefault("name", "Unnamed");
                signalos.domain.SignalType st = signalos.domain.SignalType.valueOf((String) req.getOrDefault("signalType", "SIGNAL"));
                signalos.domain.LeverageType lt = signalos.domain.LeverageType.valueOf((String) req.getOrDefault("leverageType", "HIGH"));
                signalos.domain.TaskNature tn = signalos.domain.TaskNature.valueOf((String) req.getOrDefault("taskNature", "DEEP_WORK"));
                String dueDate = (String) req.getOrDefault("dueDate", "");
                String dueTime = (String) req.getOrDefault("dueTime", "");
                String description = (String) req.getOrDefault("description", "");
                
                boolean completed = false;
                if (req.containsKey("completed")) {
                    Object compObj = req.get("completed");
                    if (compObj instanceof Boolean) {
                        completed = (Boolean) compObj;
                    } else if (compObj instanceof String) {
                        completed = Boolean.parseBoolean((String) compObj);
                    }
                }
                
                List<String> tags = List.of();
                if (req.containsKey("tags")) {
                    Object tagsObj = req.get("tags");
                    if (tagsObj instanceof List) {
                        @SuppressWarnings("unchecked")
                        List<String> parsedTags = (List<String>) tagsObj;
                        tags = parsedTags;
                    }
                }
                
                Task newTask = new Task(name, st, lt, tn, 3, tags, completed, dueDate, dueTime, description);
                taskStore.save(userId, newTask);
                
                ctx.status(201).result("Success");
            } catch(Exception e) {
                e.printStackTrace();
                ctx.status(500).result(e.getMessage());
            }
        });

        // Transaction endpoints
        app.get("/api/transactions", ctx -> {
            String userId = getUserId(ctx);
            ctx.json(transactionStore.getTransactions(userId));
        });

        app.post("/api/transactions", ctx -> {
            String userId = getUserId(ctx);
            signalos.domain.Transaction transaction = gson.fromJson(ctx.body(), signalos.domain.Transaction.class);
            if (transaction.getId() == null || transaction.getId().isEmpty()) {
                transaction.setId(java.util.UUID.randomUUID().toString());
            }
            transaction.setTimestamp(java.time.Instant.now());
            transactionStore.addTransaction(userId, transaction);
            ctx.status(201).json(transaction);
        });

        app.delete("/api/transactions/{id}", ctx -> {
            String userId = getUserId(ctx);
            String id = ctx.pathParam("id");
            transactionStore.deleteTransaction(userId, id);
            ctx.status(204);
        });

        // Events API
        app.get("/api/events", ctx -> {
            String userId = getUserId(ctx);
            String dateStr = ctx.queryParam("date");
            LocalDate date = dateStr != null ? LocalDate.parse(dateStr) : LocalDate.now();
            ctx.json(eventStore.getEvents(userId, date));
        });

        app.post("/api/events", ctx -> {
            String userId = getUserId(ctx);
            signalos.domain.CalendarEvent event = gson.fromJson(ctx.body(), signalos.domain.CalendarEvent.class);
            event.setUserId(userId);
            event.setCreatedAt(java.time.LocalDateTime.now());
            eventStore.addEvent(event);
            ctx.status(201).json(event);
        });

        app.delete("/api/events/{id}", ctx -> {
            String userId = getUserId(ctx);
            long id = Long.parseLong(ctx.pathParam("id"));
            eventStore.deleteEvent(id, userId);
            ctx.status(204);
        });

        // Sessions API
        app.get("/api/sessions", ctx -> {
            String userId = getUserId(ctx);
            ctx.json(sessionStore.loadByDate(userId, LocalDate.now()));
        });

        app.post("/api/sessions", ctx -> {
            try {
                String userId = getUserId(ctx);
                @SuppressWarnings("unchecked")
                Map<String, Object> req = gson.fromJson(ctx.body(), Map.class);
                String taskName = (String) req.getOrDefault("taskName", "General Focus Session");
                String startTimeStr = (String) req.get("startTime");
                String endTimeStr = (String) req.get("endTime");
                int interruptionCount = 0;
                if (req.containsKey("interruptionCount")) {
                    interruptionCount = ((Double) req.get("interruptionCount")).intValue();
                }
                String moodStr = (String) req.getOrDefault("mood", "NEUTRAL");

                java.time.LocalDateTime start = java.time.LocalDateTime.parse(startTimeStr.substring(0, 19));
                java.time.LocalDateTime end = java.time.LocalDateTime.parse(endTimeStr.substring(0, 19));
                
                signalos.domain.Task dummyTask = new signalos.domain.Task(taskName, signalos.domain.SignalType.SIGNAL, signalos.domain.LeverageType.HIGH, signalos.domain.TaskNature.BUILD, 3, List.of(), false, null, null, "");
                Session newSession = new Session(dummyTask, start, end, interruptionCount, signalos.domain.Mood.valueOf(moodStr));
                sessionStore.save(userId, newSession);
                
                ctx.status(201).result("Success");
            } catch(Exception e) {
                e.printStackTrace();
                ctx.status(500).result(e.getMessage());
            }
        });

        // KPIs API (return dynamic KPIs based on actual distraction and session numbers)
        app.get("/api/kpis", ctx -> {
            String userId = getUserId(ctx);
            LocalDate today = LocalDate.now();
            List<Session> todaySessions = sessionStore.loadByDate(userId, today);
            List<DistractionLog> distractions = distractionStore.loadByDate(userId, today);
            
            int productiveMins = todaySessions.stream().mapToInt(Session::getDurationMinutes).sum();
            int distractionMins = distractions.stream().mapToInt(DistractionLog::getDurationMinutes).sum();
            
            int totalMins = productiveMins + distractionMins;
            double timeScore = totalMins == 0 ? 0 : ((double) productiveMins / totalMins) * 100.0;
            
            List<Task> userTasks = taskStore.loadAll(userId);
            long completedTasks = userTasks.stream().filter(Task::isCompleted).count();
            int totalTasks = userTasks.size();
            double taskScore = totalTasks == 0 ? 0 : ((double) completedTasks / totalTasks) * 100.0;
            
            double productivityScore = (timeScore * 0.6) + (taskScore * 0.4);

            // Fetch dynamic scores using real ScoreAggregator!
            DayPlan plan = dayPlanStore.loadByDate(userId, today);
            signalos.scoring.ModeConfig modeConfig = switch(plan.getMode()) {
                case FOUNDER -> new signalos.scoring.FounderMode();
                case MONK -> new signalos.scoring.MonkMode();
                default -> new signalos.scoring.OperatorMode();
            };
            
            signalos.scoring.ScoreAggregator aggregator = new signalos.scoring.ScoreAggregator();
            signalos.scoring.DayScores scores = aggregator.aggregate(todaySessions, plan, modeConfig);
            
            // Calculate dynamic attention residue & fatigue
            double residueScore = new signalos.engines.ResidueAnalyzer().analyze(todaySessions, plan).residueScore;
            double fatigueScore = new signalos.engines.DecisionFatigueEngine().analyze(todaySessions, plan).fatigueScore;

            Map<String, Object> kpiData = new java.util.HashMap<>();
            kpiData.put("productivityScore", Math.round(productivityScore));
            kpiData.put("snr", Math.round(scores.getSnr() * 10.0) / 10.0);
            kpiData.put("leverageScore", Math.round(scores.getLeverageScore()));
            kpiData.put("priorityIntegrity", Math.round(scores.getPriorityIntegrity()));
            kpiData.put("deepWorkIndex", Math.round(scores.getDeepWorkIndex()));
            kpiData.put("effectiveFocusTime", Math.round((productiveMins / 60.0) * 10.0) / 10.0);
            kpiData.put("attentionResidue", Math.round(residueScore));
            kpiData.put("decisionFatigue", Math.round(fatigueScore * 10.0));
            kpiData.put("screenTime", productiveMins + distractionMins);
            kpiData.put("distractionTime", distractionMins);
            kpiData.put("productiveTime", productiveMins);
            kpiData.put("taskCompletionRate", Math.round(taskScore));
            
            ctx.json(kpiData);
        });

        // Distractions API GET
        app.get("/api/distractions", ctx -> {
            String userId = getUserId(ctx);
            ctx.json(distractionStore.loadByDate(userId, LocalDate.now()));
        });

        // Distractions API POST
        app.post("/api/distractions", ctx -> {
            try {
                String userId = getUserId(ctx);
                @SuppressWarnings("unchecked")
                Map<String, Object> req = gson.fromJson(ctx.body(), Map.class);
                String source = (String) req.getOrDefault("source", "Unknown");
                int durationMinutes = ((Double) req.getOrDefault("durationMinutes", 0.0)).intValue();
                
                DistractionLog log = new DistractionLog(source, durationMinutes, LocalDateTime.now());
                distractionStore.save(userId, log);
                
                ctx.status(201).result("Success");
            } catch(Exception e) {
                e.printStackTrace();
                ctx.status(500).result(e.getMessage());
            }
        });

        // Reports API GET
        app.get("/api/reports", ctx -> {
            String userId = getUserId(ctx);
            List<Map<String, Object>> reports = new java.util.ArrayList<>();
            LocalDate today = LocalDate.now();
            
            for (int i = 6; i >= 0; i--) {
                LocalDate date = today.minusDays(i);
                List<Session> daySessions = sessionStore.loadByDate(userId, date);
                List<DistractionLog> dayDistractions = distractionStore.loadByDate(userId, date);
                
                int productiveMins = daySessions.stream().mapToInt(Session::getDurationMinutes).sum();
                int distractionMins = dayDistractions.stream().mapToInt(DistractionLog::getDurationMinutes).sum();
                
                int totalMins = productiveMins + distractionMins;
                double timeScore = totalMins == 0 ? 0 : ((double) productiveMins / totalMins) * 100.0;
                
                // Estimate task score based on time score for historical data
                double taskScore = totalMins == 0 ? 0 : timeScore * 0.8;
                double productivityScore = (timeScore * 0.6) + (taskScore * 0.4);
                
                Map<String, Object> dayReport = new java.util.HashMap<>();
                dayReport.put("date", date.toString());
                dayReport.put("productivityScore", Math.round(productivityScore));
                dayReport.put("focusTime", productiveMins / 60.0);
                dayReport.put("distractionTime", distractionMins);
                dayReport.put("taskCompletionRate", Math.round(taskScore));
                reports.add(dayReport);
            }
            ctx.json(reports);
        });

        // Insights API (return dynamic computed insights)
        app.get("/api/insights", ctx -> {
            String userId = getUserId(ctx);
            LocalDate today = LocalDate.now();
            List<Session> todaySessions = sessionStore.loadByDate(userId, today);
            
            DayPlan plan = dayPlanStore.loadByDate(userId, today);
            signalos.scoring.ModeConfig modeConfig = switch(plan.getMode()) {
                case FOUNDER -> new signalos.scoring.FounderMode();
                case MONK -> new signalos.scoring.MonkMode();
                default -> new signalos.scoring.OperatorMode();
            };
            
            signalos.scoring.ScoreAggregator aggregator = new signalos.scoring.ScoreAggregator();
            signalos.scoring.DayScores scores = aggregator.aggregate(todaySessions, plan, modeConfig);
            
            signalos.insight.InsightEngine engine = new signalos.insight.InsightEngine();
            List<signalos.insight.InsightResult> rawInsights = engine.analyze(scores, plan);
            
            List<Map<String, Object>> mappedInsights = new java.util.ArrayList<>();
            int idCounter = 1;
            for (signalos.insight.InsightResult r : rawInsights) {
                Map<String, Object> m = new java.util.HashMap<>();
                m.put("id", "i-dynamic-" + idCounter++);
                m.put("message", r.getMessage() + " Recommendation: " + r.getRecommendation());
                
                String sev = "INFO";
                if (r.getSeverity() == signalos.domain.Severity.POSITIVE) sev = "SUCCESS";
                else if (r.getSeverity() == signalos.domain.Severity.WARNING) sev = "WARNING";
                else if (r.getSeverity() == signalos.domain.Severity.CRITICAL) sev = "WARNING";
                
                m.put("severity", sev);
                m.put("type", "Executive Recommendation");
                mappedInsights.add(m);
            }
            
            if (mappedInsights.isEmpty()) {
                mappedInsights.add(Map.of(
                    "id", "i-default-1",
                    "message", "Your Signal-to-Noise Ratio is healthy. Maintain deep work blocks to prevent fatigue.",
                    "severity", "SUCCESS",
                    "type", "FOCUS_INTEGRITY"
                ));
            }
            
            ctx.json(mappedInsights);
        });

        // Auth API: Register
        app.post("/api/auth/register", ctx -> {
            try {
                @SuppressWarnings("unchecked")
                Map<String, String> payload = gson.fromJson(ctx.body(), Map.class);
                String username = payload.get("username");
                String password = payload.get("password");
                if (username == null || password == null) {
                    ctx.status(400).result("Missing username or password");
                    return;
                }
                
                if (userStore.findByUsername(username).isPresent()) {
                    ctx.status(409).result("Username already exists");
                    return;
                }
                
                String userId = java.util.UUID.randomUUID().toString();
                // We're just using plaintext or weak hashing since this is a local app
                User newUser = new User(userId, username, password, LocalDateTime.now());
                userStore.save(newUser);
                
                ctx.status(201).json(Map.of("userId", userId, "username", username));
            } catch (Exception e) {
                e.printStackTrace();
                ctx.status(500).result(e.getMessage());
            }
        });

        // Auth API: Login
        app.post("/api/auth/login", ctx -> {
            try {
                @SuppressWarnings("unchecked")
                Map<String, String> payload = gson.fromJson(ctx.body(), Map.class);
                String username = payload.get("username");
                String password = payload.get("password");
                
                java.util.Optional<User> uOpt = userStore.findByUsername(username);
                if (uOpt.isPresent() && uOpt.get().getPasswordHash().equals(password)) {
                    ctx.status(200).json(Map.of("userId", uOpt.get().getId(), "username", username));
                } else {
                    ctx.status(401).result("Invalid credentials");
                }
            } catch (Exception e) {
                e.printStackTrace();
                ctx.status(500).result(e.getMessage());
            }
        });

        // Focus War Auth / Game State
        app.post("/api/war/start", ctx -> {
            String userId = getUserId(ctx);
            FocusWarSession session = new FocusWarSession(userId, LocalDate.now().toString());
            warStore.save(userId, session);
            ctx.json(session);
        });

        app.post("/api/war/{sessionId}/distraction", ctx -> {
            String userId = getUserId(ctx);
            String sessionId = ctx.pathParam("sessionId");
            java.util.Optional<FocusWarSession> opt = warStore.findAll(userId).stream()
                .filter(s -> s.getId().equals(sessionId)).findFirst();
                
            if (opt.isPresent()) {
                FocusWarSession session = opt.get();
                int newHP = Math.max(0, session.getFocusHP() - 10);
                session.setFocusHP(newHP);
                session.setDistractionCount(session.getDistractionCount() + 1);
                
                int count = session.getDistractionCount();
                if (count >= 10) session.setBossLevel(FocusWarSession.BossLevel.FINAL_BOSS);
                else if (count >= 5) session.setBossLevel(FocusWarSession.BossLevel.MINI_BOSS);
                
                if (newHP == 0) session.setWarStatus(FocusWarSession.WarStatus.DEFEATED);
                warStore.save(userId, session);
                ctx.json(session);
            } else {
                ctx.status(404).result("Session not found");
            }
        });

        app.post("/api/war/{sessionId}/focus-block", ctx -> {
            String userId = getUserId(ctx);
            String sessionId = ctx.pathParam("sessionId");
            
            // Allow passing parameter via form param, query param or body. Defaulting to query/form for brevity
            String durStr = ctx.queryParam("duration");
            if (durStr == null) {
                try {
                    @SuppressWarnings("unchecked")
                    Map<String, Double> payload = gson.fromJson(ctx.body(), Map.class);
                    durStr = String.valueOf(payload.getOrDefault("duration", 25.0).intValue());
                } catch (Exception e) {
                    durStr = "25";
                }
            }
            int duration = Integer.parseInt(durStr);
            
            java.util.Optional<FocusWarSession> opt = warStore.findAll(userId).stream()
                .filter(s -> s.getId().equals(sessionId)).findFirst();
                
            if (opt.isPresent()) {
                FocusWarSession session = opt.get();
                int hpRestore = duration / 5;
                int xpGained = duration * 2;
                session.setFocusHP(Math.min(100, session.getFocusHP() + hpRestore));
                session.setXpEarned(session.getXpEarned() + xpGained);
                warStore.save(userId, session);
                ctx.json(session);
            } else {
                ctx.status(404).result("Session not found");
            }
        });

        app.post("/api/war/{sessionId}/end", ctx -> {
            String userId = getUserId(ctx);
            String sessionId = ctx.pathParam("sessionId");
            java.util.Optional<FocusWarSession> opt = warStore.findAll(userId).stream()
                .filter(s -> s.getId().equals(sessionId)).findFirst();
                
            if (opt.isPresent()) {
                FocusWarSession session = opt.get();
                if (session.getWarStatus() == FocusWarSession.WarStatus.ONGOING) {
                    session.setWarStatus(session.getFocusHP() > 0 ? FocusWarSession.WarStatus.VICTORY : FocusWarSession.WarStatus.DEFEATED);
                    warStore.save(userId, session);
                }
                ctx.json(session);
            } else {
                ctx.status(404).result("Session not found");
            }
        });

        app.get("/api/war/history", ctx -> {
            String userId = getUserId(ctx);
            ctx.json(warStore.findAll(userId));
        });

        app.get("/api/war/rank", ctx -> {
            String userId = getUserId(ctx);
            int totalXP = warStore.getTotalXP(userId);
            String rank = "📋 Intern";
            if (totalXP >= 5000) rank = "🌟 Visionary";
            else if (totalXP >= 2000) rank = "💼 CEO";
            else if (totalXP >= 500) rank = "📊 Manager";
            ctx.result(rank);
        });

        System.out.println("API Server started on port " + port);
    }
}
