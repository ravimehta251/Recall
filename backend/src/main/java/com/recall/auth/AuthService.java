package com.recall.auth;

import com.recall.common.exception.ApiException;
import com.recall.user.User;
import com.recall.user.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AuthService {
    private final UserRepository users;
    private final PasswordEncoder passwords;
    private final JwtService jwt;

    @Transactional
    public AuthController.AuthResponse signup(AuthController.AuthRequest request) {
        String email = request.email().trim().toLowerCase();
        if (users.existsByEmailIgnoreCase(email)) {
            throw new ApiException(HttpStatus.CONFLICT, "An account with this email already exists");
        }
        User user = new User();
        user.setEmail(email);
        user.setPasswordHash(passwords.encode(request.password()));
        users.save(user);
        return response(user);
    }

    public AuthController.AuthResponse login(AuthController.AuthRequest request) {
        User user = users.findByEmailIgnoreCase(request.email().trim())
                .orElseThrow(() -> new ApiException(HttpStatus.UNAUTHORIZED, "Invalid email or password"));
        if (!passwords.matches(request.password(), user.getPasswordHash())) {
            throw new ApiException(HttpStatus.UNAUTHORIZED, "Invalid email or password");
        }
        return response(user);
    }

    private AuthController.AuthResponse response(User user) {
        return new AuthController.AuthResponse(jwt.create(user.getEmail()),
                new AuthController.UserResponse(user.getId(), user.getEmail()));
    }
}