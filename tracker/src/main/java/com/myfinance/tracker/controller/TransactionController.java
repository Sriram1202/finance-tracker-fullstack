package com.myfinance.tracker.controller;

import com.myfinance.tracker.dto.TransactionDto;
import com.myfinance.tracker.model.User;
import com.myfinance.tracker.service.TransactionService;
import com.myfinance.tracker.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.Collections;
import java.util.List;
import java.util.Map; // ✅ Added import for Map

@CrossOrigin(origins = "http://localhost:5173")
@RestController
@RequestMapping("/transactions")
public class TransactionController {

    private static final Logger log = LoggerFactory.getLogger(TransactionController.class);

    private final TransactionService transactionService;
    private final UserRepository userRepository;

    public TransactionController(TransactionService transactionService, UserRepository userRepository) {
        this.transactionService = transactionService;
        this.userRepository = userRepository;
    }

    @PostMapping("/add")
    public ResponseEntity<?> saveTransaction(
            @RequestBody com.myfinance.tracker.model.Transaction transaction,
            @RequestParam(required = false) Long categoryId,
            Authentication authentication) {
        String username = authentication.getName();
        com.myfinance.tracker.model.Transaction saved =
                transactionService.saveTransactionByUsername(transaction, username, categoryId);
        return ResponseEntity.ok(saved);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteTransaction(@PathVariable Long id, Authentication authentication) {
        String username = authentication.getName();
        transactionService.deleteTransaction(username, id);
        return ResponseEntity.ok("Transaction deleted successfully");
    }

    /**
     * GET /transactions/my
     * Only returns transactions when BOTH start and end are provided.
     * If start or end is missing, returns empty list (frontend should display message).
     */
    @GetMapping("/my")
    public ResponseEntity<List<TransactionDto>> getMyTransactions(
            Authentication authentication,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate start,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate end) {

        String username = authentication.getName();
        log.info("Received GET /transactions/my for user='{}' with start={} end={}", username, start, end);

        // If either date is missing, return empty list (frontend will ask user to apply filter)
        if (start == null || end == null) {
            log.info("Returning empty list because start or end is null");
            return ResponseEntity.ok(Collections.emptyList());
        }

        // Validate range
        if (end.isBefore(start)) {
            log.warn("Invalid date range: end < start ({} > {}) - returning empty list", start, end);
            return ResponseEntity.ok(Collections.emptyList());
        }

        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found: " + username));

        List<TransactionDto> list =
                transactionService.getTransactionsByUsernameInRangeDto(username, start, end);
        log.info("Returning {} transactions for user='{}' (start={}, end={})",
                list.size(), username, start, end);
        return ResponseEntity.ok(list);
    }

    // ✅ NEW: Dashboard summary endpoint (income, expense, balance)
    @GetMapping("/summary/my")
    public ResponseEntity<Map<String, Double>> getMySummary(Authentication authentication) {
        String username = authentication.getName();
        log.info("Received GET /transactions/summary/my for user='{}'", username);

        Map<String, Double> summary = transactionService.getSummaryByUsername(username);

        log.info("Returning summary for '{}': income={}, expense={}, balance={}",
                username,
                summary.get("income"),
                summary.get("expense"),
                summary.get("balance"));

        return ResponseEntity.ok(summary);
    }
}
