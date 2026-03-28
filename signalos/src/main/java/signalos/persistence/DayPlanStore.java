package signalos.persistence;

import signalos.domain.DayPlan;
import java.time.LocalDate;

public interface DayPlanStore {
    void save(DayPlan plan);
    DayPlan loadByDate(LocalDate date);
}
