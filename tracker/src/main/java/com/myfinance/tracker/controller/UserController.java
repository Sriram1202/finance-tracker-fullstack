package com.myfinance.tracker.controller;

import com.myfinance.tracker.model.User;
import com.myfinance.tracker.service.UserService;
import com.myfinance.tracker.security.JwtUtil;
import com.myfinance.tracker.dto.AuthResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/users")
public class UserController {

    @Autowired
    private UserService userService;

    @Autowired
    private JwtUtil jwtUtil;

    // ✅ REGISTER USER (with validation + friendly messages)
    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody User user) {
        try {
            // Manual validation for clarity
            if (user.getUsername() == null || user.getUsername().trim().isEmpty()) {
                return ResponseEntity.badRequest().body(message("Username is required."));
            }
            if (user.getEmail() == null || user.getEmail().trim().isEmpty()) {
                return ResponseEntity.badRequest().body(message("Email is required."));
            }
            if (user.getPassword() == null || user.getPassword().trim().isEmpty()) {
                return ResponseEntity.badRequest().body(message("Password is required."));
            }

            // ✅ Check duplicates (username or email)
            if (userService.existsByUsername(user.getUsername())) {
                return ResponseEntity.status(HttpStatus.CONFLICT)
                        .body(message("Username already exists. Please choose another."));
            }
            if (userService.existsByEmail(user.getEmail())) {
                return ResponseEntity.status(HttpStatus.CONFLICT)
                        .body(message("Email already registered. Please log in instead."));
            }

            // ✅ Register new user
            User savedUser = userService.registerUser(user);
            return ResponseEntity.status(HttpStatus.CREATED).body(message("User registered successfully!"));

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(message("Server error. Please try again later."));
        }
    }

    // ✅ LOGIN USER
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody User user) {
        try {
            User loggedInUser = userService.login(user.getUsername(), user.getPassword());
            String token = jwtUtil.generateToken(loggedInUser.getUsername());
            return ResponseEntity.ok(new AuthResponse(token));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(message(e.getMessage())); // shows readable login error
        }
    }

    // ✅ GET USER BY ID
    @GetMapping("/{id}")
    public ResponseEntity<?> getUser(@PathVariable Long id) {
        try {
            User user = userService.getUserById(id);
            return ResponseEntity.ok(user);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(message(e.getMessage()));
        }
    }
    // ✅ Get current user profile from JWT token
@GetMapping("/profile")
public ResponseEntity<?> getProfile(@RequestHeader("Authorization") String token) {
    try {
        if (token == null || !token.startsWith("Bearer ")) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(message("Missing or invalid Authorization header"));
        }

        // remove "Bearer " and decode username
        String jwt = token.substring(7);
        String username = jwtUtil.extractUsername(jwt);

        // find user by username
        User user = userService.getUserByUsername(username);
        if (user == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(message("User not found"));
        }

        // return minimal profile info
        Map<String, Object> profile = new HashMap<>();
        profile.put("id", user.getId());
        profile.put("username", user.getUsername());
        profile.put("email", user.getEmail());

        return ResponseEntity.ok(profile);

    } catch (Exception e) {
        e.printStackTrace();
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(message("Invalid or expired token"));
    }
}


    // Helper for clean JSON messages
    private Map<String, String> message(String msg) {
        Map<String, String> map = new HashMap<>();
        map.put("message", msg);
        return map;
    }
    
}
