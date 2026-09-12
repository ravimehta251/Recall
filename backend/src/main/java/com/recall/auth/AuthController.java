package com.recall.auth;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
public class AuthController {
    private final AuthService service;

    @PostMapping("/signup")
    ResponseEntity<AuthResponse> signup(@Valid @RequestBody AuthRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(service.signup(request));
    }

    @PostMapping("/login")
    AuthResponse login(@Valid @RequestBody AuthRequest request) {
        return service.login(request);
    }

    public record AuthRequest(@NotBlank @Email String email,
                              @NotBlank @Size(min = 8, max = 100) String password) {}
    public record UserResponse(UUID id, String email) {}
    public record AuthResponse(String token, UserResponse user) {}
}