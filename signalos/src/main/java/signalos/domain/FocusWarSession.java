package signalos.domain;

import java.util.UUID;

public class FocusWarSession {

    public enum BossLevel { NONE, MINI_BOSS, FINAL_BOSS }
    public enum WarStatus { ONGOING, VICTORY, DEFEATED }

    private final String id;
    private final String userId;
    private final String sessionDate;
    private int focusHP;
    private int distractionCount;
    private int xpEarned;
    private BossLevel bossLevel;
    private WarStatus warStatus;
    private final String createdAt;
    private String updatedAt;

    // For new session
    public FocusWarSession(String userId, String sessionDate) {
        this.id = UUID.randomUUID().toString();
        this.userId = userId;
        this.sessionDate = sessionDate;
        this.focusHP = 100;
        this.distractionCount = 0;
        this.xpEarned = 0;
        this.bossLevel = BossLevel.NONE;
        this.warStatus = WarStatus.ONGOING;
        this.createdAt = java.time.Instant.now().toString();
        this.updatedAt = this.createdAt;
    }

    // For loading from store
    public FocusWarSession(String id, String userId, String sessionDate, int focusHP, int distractionCount, int xpEarned, BossLevel bossLevel, WarStatus warStatus, String createdAt, String updatedAt) {
        this.id = id;
        this.userId = userId;
        this.sessionDate = sessionDate;
        this.focusHP = focusHP;
        this.distractionCount = distractionCount;
        this.xpEarned = xpEarned;
        this.bossLevel = bossLevel;
        this.warStatus = warStatus;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }

    public String getId() { return id; }
    public String getUserId() { return userId; }
    public String getSessionDate() { return sessionDate; }
    
    public int getFocusHP() { return focusHP; }
    public void setFocusHP(int focusHP) { this.focusHP = focusHP; updateTimestamp(); }
    
    public int getDistractionCount() { return distractionCount; }
    public void setDistractionCount(int distractionCount) { this.distractionCount = distractionCount; updateTimestamp(); }
    
    public int getXpEarned() { return xpEarned; }
    public void setXpEarned(int xpEarned) { this.xpEarned = xpEarned; updateTimestamp(); }
    
    public BossLevel getBossLevel() { return bossLevel; }
    public void setBossLevel(BossLevel bossLevel) { this.bossLevel = bossLevel; updateTimestamp(); }
    
    public WarStatus getWarStatus() { return warStatus; }
    public void setWarStatus(WarStatus warStatus) { this.warStatus = warStatus; updateTimestamp(); }
    
    public String getCreatedAt() { return createdAt; }
    public String getUpdatedAt() { return updatedAt; }

    private void updateTimestamp() {
        this.updatedAt = java.time.Instant.now().toString();
    }
}
