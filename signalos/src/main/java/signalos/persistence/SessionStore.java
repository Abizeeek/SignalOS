package signalos.persistence;

import signalos.domain.Session;
import java.time.LocalDate;
import java.util.List;

public interface SessionStore {
    void save(String userId, Session session);
    List<Session> loadByDate(String userId, LocalDate date);
    List<Session> loadRange(String userId, LocalDate from, LocalDate to);
}
