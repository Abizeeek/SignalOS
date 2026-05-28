package signalos.domain;

import java.time.Instant;
import java.util.Objects;

public class Transaction {
    private String id;
    private String description;
    private double amount;
    private String type; // "INCOME" or "EXPENSE"
    private Instant timestamp;

    public Transaction() {}

    public Transaction(String id, String description, double amount, String type, Instant timestamp) {
        this.id = id;
        this.description = description;
        this.amount = amount;
        this.type = type;
        this.timestamp = timestamp;
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    
    public double getAmount() { return amount; }
    public void setAmount(double amount) { this.amount = amount; }
    
    public String getType() { return type; }
    public void setType(String type) { this.type = type; }
    
    public Instant getTimestamp() { return timestamp; }
    public void setTimestamp(Instant timestamp) { this.timestamp = timestamp; }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        Transaction that = (Transaction) o;
        return Objects.equals(id, that.id);
    }

    @Override
    public int hashCode() {
        return Objects.hash(id);
    }
}
