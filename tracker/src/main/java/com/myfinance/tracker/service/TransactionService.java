package com.myfinance.tracker.service;
import com.myfinance.tracker.dto.TransactionDto;
import com.myfinance.tracker.model.Category;
import com.myfinance.tracker.model.Expense;
import com.myfinance.tracker.model.Transaction;
import com.myfinance.tracker.model.User;
import com.myfinance.tracker.repository.CategoryRepository;
import com.myfinance.tracker.repository.ExpenseRepository;
import com.myfinance.tracker.repository.TransactionRepository;
import com.myfinance.tracker.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class TransactionService {

    private final TransactionRepository transactionRepository;
    private final UserRepository userRepository;
    private final CategoryRepository categoryRepository;
    private final ExpenseRepository expenseRepository;

    public TransactionService(TransactionRepository transactionRepository,
                              UserRepository userRepository,
                              CategoryRepository categoryRepository,
                              ExpenseRepository expenseRepository) {
        this.transactionRepository = transactionRepository;
        this.userRepository = userRepository;
        this.categoryRepository = categoryRepository;
        this.expenseRepository = expenseRepository;
    }

    /**
     * Save new transaction (with optional category) by userId.
     * If type = "debit", also add entry in Expense table
     */
    public Transaction saveTransaction(Transaction transaction, Long userId, Long categoryId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + userId));

        transaction.setUser(user);

        if (categoryId != null) {
            Category category = categoryRepository.findById(categoryId)
                    .orElseThrow(() -> new RuntimeException("Category not found with id: " + categoryId));
            transaction.setCategory(category);
        } else {
            transaction.setCategory(null);
        }

        Transaction saved = transactionRepository.save(transaction);

        // if debit, add to expense table as well
        if (transaction.getType() != null && transaction.getType().equalsIgnoreCase("debit")) {
            createExpenseFromTransaction(saved, transaction.getCategory());
        }

        return saved;
    }

    /**
     * Save transaction for currently authenticated user (by username).
     */
    public Transaction saveTransactionByUsername(Transaction transaction, String username, Long categoryId) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found with username: " + username));
        return saveTransaction(transaction, user.getId(), categoryId);
    }

    /**
     * Get all transactions for a user (ordered newest first).
     */
    // ✅ This method returns entity objects for internal logic (no change to old code)
public List<Transaction> getTransactionsByUserId(Long userId) {
    User user = userRepository.findById(userId)
            .orElseThrow(() -> new RuntimeException("User not found with id: " + userId));
    return transactionRepository.findByUser(user);
}

// ✅ This one returns lightweight TransactionDto objects for frontend display
public List<TransactionDto> getTransactionsByUserIdDto(Long userId) {
    User user = userRepository.findById(userId)
            .orElseThrow(() -> new RuntimeException("User not found with id: " + userId));

    return transactionRepository.findByUser(user).stream()
            .map(t -> new TransactionDto(
                    t.getId(),
                    t.getDescription(),
                    t.getAmount(),
                    t.getDate(),
                    t.getType(),
                    t.getCategory() != null ? t.getCategory().getName() : null
            ))
            .collect(Collectors.toList());
}


    /**
     * Get all transactions for a user by username (ordered newest first).
     */
    public List<Transaction> getTransactionsByUsername(String username) {
    User user = userRepository.findByUsername(username)
            .orElseThrow(() -> new RuntimeException("User not found with username: " + username));
    // use repository method that returns List ordered by date desc
    return transactionRepository.findByUserOrderByDateDesc(user);
}
    /**
     * Get transactions for a user within a date range (inclusive), ordered newest first.
     */
    public List<Transaction> getTransactionsByUsernameInRange(String username, LocalDate start, LocalDate end) {
    User user = userRepository.findByUsername(username)
            .orElseThrow(() -> new RuntimeException("User not found with username: " + username));

    if (start == null || end == null) {
        return transactionRepository.findByUserOrderByDateDesc(user);
    }

    List<Transaction> txns = transactionRepository.findByUserAndDateBetween(user, start, end);
    txns.sort(Comparator.comparing(Transaction::getDate).reversed());
    return txns;
}
    /**
     * Fetch transactions for a given month (by userId)
     */
    public List<Transaction> getMonthlyTransactions(Long userId, int year, int month) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + userId));

        LocalDate start = LocalDate.of(year, month, 1);
        LocalDate end = start.withDayOfMonth(start.lengthOfMonth());

        return transactionRepository.findByUserAndDateBetween(user, start, end)
                .stream()
                .sorted(Comparator.comparing(Transaction::getDate).reversed())
                .collect(Collectors.toList());
    }

    /**
     * Delete a transaction by id after verifying ownership. If transaction is a debit,
     * attempt to find & delete a corresponding Expense record (best-effort).
     */
    public void deleteTransaction(String username, Long transactionId) {
        Transaction transaction = transactionRepository.findById(transactionId)
                .orElseThrow(() -> new RuntimeException("Transaction not found"));

        if (!transaction.getUser().getUsername().equals(username)) {
            throw new RuntimeException("Unauthorized deletion attempt");
        }

        // Best-effort: delete matching expense when transaction is debit.
        try {
            if ("debit".equalsIgnoreCase(transaction.getType())) {
                // match by title/amount/date heuristic (same as ExpenseService uses)
                List<Expense> possible = expenseRepository.findByUserOrderByDateDesc(transaction.getUser());
                Optional<Expense> match = possible.stream()
                        .filter(e -> Objects.equals(e.getAmount(), transaction.getAmount())
                                && Objects.equals(e.getDate(), transaction.getDate())
                                && (transaction.getDescription() == null || transaction.getDescription().isEmpty()
                                    || Objects.equals(e.getTitle(), transaction.getDescription())))
                        .findFirst();
                match.ifPresent(expenseRepository::delete);
            }
        } catch (Exception e) {
            // log and continue; do not block deletion of transaction on expense-delete failure
            e.printStackTrace();
        }

        transactionRepository.delete(transaction);
    }

    /**
     * Get summary grouped by category for transactions (by userId).
     */
    public Map<String, Double> getCategorySummary(Long userId) {
        List<Transaction> transactions = getTransactionsByUserId(userId);

        return transactions.stream()
                .filter(t -> t.getCategory() != null)
                .collect(Collectors.groupingBy(
                        t -> t.getCategory().getName(),
                        Collectors.summingDouble(Transaction::getAmount)
                ));
    }

    // Helper: create corresponding Expense from Transaction
    private void createExpenseFromTransaction(Transaction tx, Category category) {
        try {
            Expense exp = new Expense();
            exp.setTitle(tx.getDescription() != null ? tx.getDescription() : "");
            exp.setAmount(tx.getAmount());
            exp.setCategory(category != null ? category.getName() : null);
            exp.setDate(tx.getDate());
            exp.setUser(tx.getUser());
            expenseRepository.save(exp);
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
    public List<TransactionDto> getTransactionsByUsernameInRangeDto(String username, LocalDate start, LocalDate end) {
    // re-use existing logic
    List<com.myfinance.tracker.model.Transaction> txns = getTransactionsByUsernameInRange(username, start, end);
    return txns.stream()
            .map(t -> new TransactionDto(
                    t.getId(),
                    t.getDescription(),
                    t.getAmount(),
                    t.getDate(),
                    t.getType(),
                    t.getCategory() != null ? t.getCategory().getName() : null
            ))
            .sorted(Comparator.comparing((TransactionDto d) -> d.getDate()).reversed())
            .collect(Collectors.toList());
}
public Map<String, Double> getSummaryByUsername(String username) {
    User user = userRepository.findByUsername(username)
            .orElseThrow(() -> new RuntimeException("User not found with username: " + username));

    List<Transaction> txns = transactionRepository.findByUser(user);

    double income = 0.0;
    double expense = 0.0;

    for (Transaction t : txns) {
        if (t.getType() != null && t.getType().equalsIgnoreCase("credit")) {
            income += t.getAmount();
        } else { // treat null/other as debit/expense (or you can check explicit "debit")
            expense += t.getAmount();
        }
    }

    Map<String, Double> map = new HashMap<>();
    map.put("income", income);
    map.put("expense", expense);
    map.put("balance", income - expense);
    return map;
}
}
