package signalos.persistence;

import signalos.domain.SignalType;
import signalos.domain.Task;
import java.util.List;

public interface TaskStore {
    void save(String userId, Task task);
    List<Task> findByTag(String userId, String tag);
    List<Task> findBySignalType(String userId, SignalType type);
    List<Task> loadAll(String userId);
}
