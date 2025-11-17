package com.myfinance.tracker.repository;

import com.myfinance.tracker.model.Category;
import com.myfinance.tracker.model.User;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface CategoryRepository extends JpaRepository<Category, Long> {
    Optional<Category> findByName(String name);
    List<Category> findByUser(User user);

}
