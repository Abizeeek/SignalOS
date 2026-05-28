package signalos.persistence;

import signalos.domain.CalendarEvent;
import java.util.List;
import java.time.LocalDate;

public interface EventStore {
    List<CalendarEvent> getEvents(String userId, LocalDate date);
    void addEvent(CalendarEvent event);
    void deleteEvent(long id, String userId);
}
