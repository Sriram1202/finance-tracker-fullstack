package com.myfinance.tracker.service;

import com.myfinance.tracker.model.Expense;
import com.myfinance.tracker.model.Transaction;
import com.myfinance.tracker.model.User;
import com.myfinance.tracker.model.Category;
import com.myfinance.tracker.repository.ExpenseRepository;
import com.myfinance.tracker.repository.UserRepository;
import com.myfinance.tracker.repository.TransactionRepository;
import com.myfinance.tracker.repository.CategoryRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Service
public class ExpenseService {

    private final ExpenseRepository expenseRepository;
    private final UserRepository userRepository;
    private final TransactionRepository transactionRepository;
    private final CategoryRepository categoryRepository;

    public ExpenseService(
            ExpenseRepository expenseRepository,
            UserRepository userRepository,
            TransactionRepository transactionRepository,
            CategoryRepository categoryRepository
    ) {
        this.expenseRepository = expenseRepository;
        this.userRepository = userRepository;
        this.transactionRepository = transactionRepository;
        this.categoryRepository = categoryRepository;
    }

    // ✅ Add Expense + create corresponding Transaction
    public Expense addExpense(String username, Expense expense) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));
        expense.setUser(user);
        Expense saved = expenseRepository.save(expense);

        createTransactionFromExpense(saved);
        return saved;
    }

    // ✅ Get all user expenses
    public List<Expense> getUserExpenses(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return expenseRepository.findByUser(user);
    }

    // ✅ Get user expenses in a date range (for filtering)
    public List<Expense> getUserExpensesInRange(String username, LocalDate start, LocalDate end) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return expenseRepository.findByUserAndDateBetween(user, start, end);
    }

    // ✅ Update Expense and matching Transaction
    public Expense updateExpense(String username, Long id, Expense updatedExpense) {
        Expense existing = expenseRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Expense not found"));

        if (!existing.getUser().getUsername().equals(username)) {
            throw new RuntimeException("Unauthorized");
        }

        existing.setTitle(updatedExpense.getTitle());
        existing.setAmount(updatedExpense.getAmount());
        existing.setCategory(updatedExpense.getCategory());
        existing.setDate(updatedExpense.getDate());

        Expense saved = expenseRepository.save(existing);

        transactionRepository.findByUser(existing.getUser()).stream()
                .filter(tx -> tx.getDescription() != null
                        && tx.getDescription().equals(existing.getTitle())
                        && "debit".equalsIgnoreCase(tx.getType()))
                .findFirst()
                .ifPresent(tx -> {
                    tx.setDescription(existing.getTitle());
                    tx.setAmount(existing.getAmount() == null ? 0.0 : existing.getAmount());
                    tx.setDate(existing.getDate());
                    if (existing.getCategory() != null) {
                        categoryRepository.findByName(existing.getCategory()).ifPresent(tx::setCategory);
                    }
                    transactionRepository.save(tx);
                });

        return saved;
    }

    // ✅ Delete Expense and matching Transaction
    public void deleteExpense(String username, Long id) {
        Expense existing = expenseRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Expense not found"));

        if (!existing.getUser().getUsername().equals(username)) {
            throw new RuntimeException("Unauthorized");
        }

        expenseRepository.delete(existing);

        transactionRepository.findByUser(existing.getUser()).stream()
                .filter(tx -> tx.getDescription() != null
                        && tx.getDescription().equals(existing.getTitle())
                        && "debit".equalsIgnoreCase(tx.getType()))
                .findFirst()
                .ifPresent(transactionRepository::delete);
    }

    // ✅ Helper: create matching Transaction from Expense
    private void createTransactionFromExpense(Expense expense) {
        try {
            Transaction tx = new Transaction();
            tx.setDescription(expense.getTitle() != null ? expense.getTitle() : "");
            tx.setAmount(expense.getAmount() == null ? 0.0 : expense.getAmount());
            tx.setType("debit");
            tx.setDate(expense.getDate());
            tx.setUser(expense.getUser());

            if (expense.getCategory() != null && !expense.getCategory().isBlank()) {
                categoryRepository.findByName(expense.getCategory()).ifPresent(tx::setCategory);
            } else {
                tx.setCategory(null);
            }

            transactionRepository.save(tx);
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}
