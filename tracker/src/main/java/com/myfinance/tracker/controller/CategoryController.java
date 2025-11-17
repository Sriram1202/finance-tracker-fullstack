package com.myfinance.tracker.controller;

import com.myfinance.tracker.model.Category;
import com.myfinance.tracker.repository.CategoryRepository;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@CrossOrigin(origins = "http://localhost:5173")
@RestController
@RequestMapping("/categories")
public class CategoryController {

    private final CategoryRepository categoryRepository;

    public CategoryController(CategoryRepository categoryRepository) {
        this.categoryRepository = categoryRepository;
    }

    // ✅ Only fetch all categories (for dropdowns)
    @GetMapping
    public List<Category> getAllCategories() {
        return categoryRepository.findAll();
    }
}
