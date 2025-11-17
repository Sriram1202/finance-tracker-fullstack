package com.myfinance.tracker.controller;

import com.myfinance.tracker.model.User;
import com.myfinance.tracker.repository.UserRepository;
import com.myfinance.tracker.service.ExpenseReportService;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.Map;

@RestController
@RequestMapping("/expenses/summary")
public class ExpenseReportController {

    private final ExpenseReportService reportService;
    private final UserRepository userRepository;

    public ExpenseReportController(ExpenseReportService reportService, UserRepository userRepository) {
        this.reportService = reportService;
        this.userRepository = userRepository;
    }

    private Long currentUserId(Authentication authentication) {
        String username = authentication.getName();
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found: " + username));
        return user.getId();
    }

    // GET /expenses/summary/category
    @GetMapping("/category")
    public Map<String, Double> getCategorySummary(Authentication authentication) {
        System.out.println(">>> /expenses/summary/category CALLED");
        Long userId = currentUserId(authentication);
        return reportService.getTotalByCategory(userId);
    }

    // GET /expenses/summary/monthly
    @GetMapping("/monthly")
    public Map<String, Double> getMonthlySummary(Authentication authentication) {
        System.out.println(">>> /expenses/summary/monthly CALLED");
        Long userId = currentUserId(authentication);
        return reportService.getTotalByMonth(userId);
    }

    // GET /expenses/summary/range?start=2025-08-01&end=2025-08-31
    @GetMapping("/range")
    public Double getRangeSummary(
            Authentication authentication,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate start,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate end) {
        System.out.println(">>> /expenses/summary/range CALLED");
        Long userId = currentUserId(authentication);
        return reportService.getTotalInRange(userId, start, end);
    }

    // ✅ NEW: GET /expenses/summary/range/category?start=2025-08-01&end=2025-08-31
    @GetMapping("/range/category")
    public Map<String, Double> getRangeCategorySummary(
            Authentication authentication,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate start,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate end) {
        System.out.println(">>> /expenses/summary/range/category CALLED");
        Long userId = currentUserId(authentication);
        return reportService.getTotalByCategoryInRange(userId, start, end);
    }
}
