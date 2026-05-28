package signalos.persistence;

import signalos.domain.Transaction;
import java.util.List;

public interface TransactionStore {
    List<Transaction> getTransactions(String userId);
    void addTransaction(String userId, Transaction transaction);
    void deleteTransaction(String userId, String id);
}
