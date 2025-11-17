package com.myfinance.tracker.repository;

import com.myfinance.tracker.model.Expense;
import com.myfinance.tracker.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface ExpenseRepository extends JpaRepository<Expense, Long> {
    List<Expense> findByUser(User user);
    // in ExpenseRepository
List<Expense> findByUserAndDateBetween(User user, LocalDate start, LocalDate end);

    // ✅ new method for sorting expenses by date descending
    List<Expense> findByUserOrderByDateDesc(User user);

    @Query("SELECT e.category, SUM(e.amount) FROM Expense e WHERE e.user.id = :userId GROUP BY e.category")
    List<Object[]> getTotalByCategory(@Param("userId") Long userId);

    @Query(value = "SELECT YEAR(e.date) AS yr, MONTH(e.date) AS mon, SUM(e.amount) AS total " +
                   "FROM expense e WHERE e.user_id = :userId GROUP BY YEAR(e.date), MONTH(e.date) ORDER BY yr, mon",
           nativeQuery = true)
    List<Object[]> getTotalByYearMonth(@Param("userId") Long userId);

    @Query("SELECT SUM(e.amount) FROM Expense e WHERE e.user.id = :userId AND e.date BETWEEN :start AND :end")
    Double getTotalInDateRange(@Param("userId") Long userId,
                               @Param("start") LocalDate start,
                               @Param("end") LocalDate end);

    @Query("SELECT e.category, SUM(e.amount) FROM Expense e WHERE e.user.id = :userId AND e.date BETWEEN :start AND :end GROUP BY e.category")
    List<Object[]> getTotalByCategoryInDateRange(@Param("userId") Long userId,
                                                 @Param("start") LocalDate start,
                                                 @Param("end") LocalDate end);
}
