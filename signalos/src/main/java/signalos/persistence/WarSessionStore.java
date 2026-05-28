package signalos.persistence;

import signalos.domain.FocusWarSession;
import java.util.List;
import java.util.Optional;

public interface WarSessionStore {
    void save(String userId, FocusWarSession session);
    List<FocusWarSession> findAll(String userId);
    Optional<FocusWarSession> findActiveSession(String userId);
    int getTotalXP(String userId);
}
