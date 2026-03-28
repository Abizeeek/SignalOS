package signalos.persistence;

import signalos.domain.Session;
import java.time.LocalDate;
import java.util.List;

public interface SessionStore {
    void save(Session session);
    List<Session> loadByDate(LocalDate date);
    List<Session> loadRange(LocalDate from, LocalDate to);
}
