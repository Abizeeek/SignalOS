package signalos.persistence;

import signalos.domain.DistractionLog;
import java.time.LocalDate;
import java.util.List;

public interface DistractionStore {
    List<DistractionLog> loadAll(String userId);
    List<DistractionLog> loadByDate(String userId, LocalDate date);
    void save(String userId, DistractionLog distraction);
}
