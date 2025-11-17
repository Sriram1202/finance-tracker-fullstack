package com.myfinance.tracker.service;

import com.myfinance.tracker.repository.ExpenseRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Service
public class ExpenseReportService {

    private final ExpenseRepository expenseRepository;

    public ExpenseReportService(ExpenseRepository expenseRepository) {
        this.expenseRepository = expenseRepository;
    }

    public Map<String, Double> getTotalByCategory(Long userId) {
        List<Object[]> rows = expenseRepository.getTotalByCategory(userId);
        Map<String, Double> map = new LinkedHashMap<>();
        for (Object[] r : rows) {
            String category = (String) r[0];
            Double sum = r[1] == null ? 0.0 : ((Number) r[1]).doubleValue();
            map.put(category, sum);
        }
        return map;
    }

    public Map<String, Double> getTotalByMonth(Long userId) {
        List<Object[]> rows = expenseRepository.getTotalByYearMonth(userId);
        Map<String, Double> map = new LinkedHashMap<>();
        for (Object[] r : rows) {
            int year = ((Number) r[0]).intValue();
            int month = ((Number) r[1]).intValue();
            Double sum = r[2] == null ? 0.0 : ((Number) r[2]).doubleValue();
            String key = String.format("%04d-%02d", year, month); // e.g. "2025-08"
            map.put(key, sum);
        }
        return map;
    }

    public Double getTotalInRange(Long userId, LocalDate startDate, LocalDate endDate) {
        Double total = expenseRepository.getTotalInDateRange(userId, startDate, endDate);
        return total == null ? 0.0 : total;
    }

    // ✅ NEW: category summary in range
    public Map<String, Double> getTotalByCategoryInRange(Long userId, LocalDate startDate, LocalDate endDate) {
        List<Object[]> rows = expenseRepository.getTotalByCategoryInDateRange(userId, startDate, endDate);
        Map<String, Double> map = new LinkedHashMap<>();
        for (Object[] r : rows) {
            String category = (String) r[0];
            Double sum = r[1] == null ? 0.0 : ((Number) r[1]).doubleValue();
            map.put(category, sum);
        }
        return map;
    }
}
