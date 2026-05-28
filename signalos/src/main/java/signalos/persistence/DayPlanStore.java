package signalos.persistence;

import signalos.domain.DayPlan;
import java.time.LocalDate;

public interface DayPlanStore {
    void save(String userId, DayPlan plan);
    DayPlan loadByDate(String userId, LocalDate date);
}
