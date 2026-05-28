package signalos.persistence;

import signalos.domain.Transaction;
import java.io.*;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

public class CsvTransactionStore implements TransactionStore {
    private final String baseDir;

    public CsvTransactionStore(String baseDir) {
        this.baseDir = baseDir;
    }

    private Path getFilePath(String userId) throws IOException {
        Path userDir = Paths.get(baseDir, userId);
        if (!Files.exists(userDir)) {
            Files.createDirectories(userDir);
        }
        Path file = userDir.resolve("transactions.csv");
        if (!Files.exists(file)) {
            Files.createFile(file);
            try (PrintWriter writer = new PrintWriter(new FileWriter(file.toFile()))) {
                writer.println("id,description,amount,type,timestamp");
            }
        }
        return file;
    }

    @Override
    public List<Transaction> getTransactions(String userId) {
        List<Transaction> transactions = new ArrayList<>();
        try {
            Path file = getFilePath(userId);
            List<String> lines = Files.readAllLines(file);
            for (int i = 1; i < lines.size(); i++) {
                String line = lines.get(i);
                if (line.trim().isEmpty()) continue;
                String[] parts = line.split(",");
                if (parts.length >= 5) {
                    transactions.add(new Transaction(
                        parts[0],
                        parts[1],
                        Double.parseDouble(parts[2]),
                        parts[3],
                        Instant.parse(parts[4])
                    ));
                }
            }
        } catch (IOException e) {
            e.printStackTrace();
        }
        return transactions;
    }

    @Override
    public void addTransaction(String userId, Transaction transaction) {
        List<Transaction> transactions = getTransactions(userId);
        transactions.add(transaction);
        saveAll(userId, transactions);
    }

    @Override
    public void deleteTransaction(String userId, String id) {
        List<Transaction> transactions = getTransactions(userId);
        transactions.removeIf(t -> t.getId().equals(id));
        saveAll(userId, transactions);
    }

    private void saveAll(String userId, List<Transaction> transactions) {
        try {
            Path file = getFilePath(userId);
            try (PrintWriter writer = new PrintWriter(new FileWriter(file.toFile()))) {
                writer.println("id,description,amount,type,timestamp");
                for (Transaction t : transactions) {
                    writer.printf("%s,%s,%.2f,%s,%s%n",
                            t.getId(),
                            t.getDescription().replace(",", ""),
                            t.getAmount(),
                            t.getType(),
                            t.getTimestamp().toString());
                }
            }
        } catch (IOException e) {
            e.printStackTrace();
        }
    }
}
