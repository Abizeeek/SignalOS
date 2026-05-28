package signalos.persistence;

import signalos.domain.User;
import java.util.Optional;

public interface UserStore {
    void save(User user);
    Optional<User> findById(String id);
    Optional<User> findByUsername(String username);
}
