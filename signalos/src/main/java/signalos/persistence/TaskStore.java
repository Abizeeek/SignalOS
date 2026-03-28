package signalos.persistence;

import signalos.domain.SignalType;
import signalos.domain.Task;
import java.util.List;

public interface TaskStore {
    void save(Task task);
    List<Task> findByTag(String tag);
    List<Task> findBySignalType(SignalType type);
    List<Task> loadAll();
}
