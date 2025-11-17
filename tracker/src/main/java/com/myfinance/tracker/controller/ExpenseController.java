package com.myfinance.tracker.controller;

import com.myfinance.tracker.model.Expense;
import com.myfinance.tracker.service.ExpenseService;
import com.myfinance.tracker.service.ExpenseReportService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.Collections;
import java.util.List;

@CrossOrigin(origins = "http://localhost:5173")
@RestController
@RequestMapping("/expenses")
public class ExpenseController {

    private static final Logger log = LoggerFactory.getLogger(ExpenseController.class);

    private final ExpenseService expenseService;
    private final ExpenseReportService reportService;

    public ExpenseController(ExpenseService expenseService, ExpenseReportService reportService) {
        this.expenseService = expenseService;
        this.reportService = reportService;
    }

    @PostMapping("/add")
    public Expense addExpense(@RequestBody Expense expense, Authentication authentication) {
        String username = authentication.getName();
        return expenseService.addExpense(username, expense);
    }

    /**
     * GET /expenses/my
     * Requires both start and end to return results. Otherwise returns empty list.
     */
    @GetMapping("/my")
    public ResponseEntity<List<Expense>> getMyExpenses(
            Authentication authentication,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate start,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate end) {

        String username = authentication.getName();
        log.info("GET /expenses/my for user='{}' start={} end={}", username, start, end);

        if (start == null || end == null) {
            log.info("Returning empty expenses list because start or end missing");
            return ResponseEntity.ok(Collections.emptyList());
        }

        if (end.isBefore(start)) {
            log.warn("Invalid expense date range: end < start");
            return ResponseEntity.ok(Collections.emptyList());
        }

        List<Expense> list = expenseService.getUserExpensesInRange(username, start, end);
        log.info("Returning {} expenses for user='{}'", list.size(), username);
        return ResponseEntity.ok(list);
    }

    @PutMapping("/update/{id}")
    public Expense updateExpense(@PathVariable Long id, @RequestBody Expense expense, Authentication authentication) {
        String username = authentication.getName();
        return expenseService.updateExpense(username, id, expense);
    }

    @DeleteMapping("/delete/{id}")
    public ResponseEntity<String> deleteExpense(@PathVariable Long id, Authentication authentication) {
        String username = authentication.getName();
        expenseService.deleteExpense(username, id);
        return ResponseEntity.ok("Expense deleted successfully");
    }
}
