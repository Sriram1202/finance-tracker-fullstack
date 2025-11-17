package com.myfinance.tracker.repository;

import com.myfinance.tracker.model.Transaction;
import com.myfinance.tracker.model.User;
import com.myfinance.tracker.model.Category;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface TransactionRepository extends JpaRepository<Transaction, Long> {
    List<Transaction> findByUser(User user);
    List<Transaction> findByUserAndDateBetween(User user, LocalDate start, LocalDate end);
    List<Transaction> findByUserAndCategory(User user, Category category);

    // ✅ new method to get all user transactions sorted by latest first
    List<Transaction> findByUserOrderByDateDesc(User user);
}
