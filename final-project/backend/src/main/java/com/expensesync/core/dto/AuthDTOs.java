package com.expensesync.core.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class AuthDTOs {

    public static class RegisterRequest {
        @NotBlank(message = "Name cannot be blank")
        private String name;

        @NotBlank(message = "Email is required")
        @Email(message = "Valid email address required")
        private String email;

        @NotBlank(message = "Password is required")
        @Size(min = 8, message = "Password must be at least 8 characters")
        private String password;

        private String defaultCurrency = "INR";

        public RegisterRequest() {}

        public String getName() { return name; }
        public void setName(String name) { this.name = name; }
        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }
        public String getPassword() { return password; }
        public void setPassword(String password) { this.password = password; }
        public String getDefaultCurrency() { return defaultCurrency; }
        public void setDefaultCurrency(String defaultCurrency) { this.defaultCurrency = defaultCurrency; }
    }

    public static class LoginRequest {
        @NotBlank(message = "Email is required")
        @Email(message = "Valid email address required")
        private String email;

        @NotBlank(message = "Password is required")
        private String password;

        public LoginRequest() {}

        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }
        public String getPassword() { return password; }
        public void setPassword(String password) { this.password = password; }
    }

    public static class AuthResponse {
        private String token;
        private Long id;
        private String name;
        private String email;
        private String currency;

        public AuthResponse() {}

        public AuthResponse(String token, Long id, String name, String email, String currency) {
            this.token = token;
            this.id = id;
            this.name = name;
            this.email = email;
            this.currency = currency;
        }

        public String getToken() { return token; }
        public void setToken(String token) { this.token = token; }
        public Long getId() { return id; }
        public void setId(Long id) { this.id = id; }
        public String getName() { return name; }
        public void setName(String name) { this.name = name; }
        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }
        public String getCurrency() { return currency; }
        public void setCurrency(String currency) { this.currency = currency; }
    }
}

