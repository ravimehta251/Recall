package com.recall.auth;

import com.recall.common.exception.ApiException;
import com.recall.user.User;
import com.recall.user.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {
    @Mock private UserRepository users;
    @Mock private PasswordEncoder passwords;
    @Mock private JwtService jwt;
    private AuthService service;

    @BeforeEach
    void setUp() {
        service = new AuthService(users, passwords, jwt);
    }

    @Test
    void signupNormalizesEmailAndHashesPassword() {
        when(passwords.encode("password123")).thenReturn("hashed");
        when(jwt.create("person@example.com")).thenReturn("token");

        var response = service.signup(new AuthController.AuthRequest(" Person@Example.com ", "password123"));

        ArgumentCaptor<User> saved = ArgumentCaptor.forClass(User.class);
        verify(users).save(saved.capture());
        assertThat(saved.getValue().getEmail()).isEqualTo("person@example.com");
        assertThat(saved.getValue().getPasswordHash()).isEqualTo("hashed");
        assertThat(response.token()).isEqualTo("token");
    }

    @Test
    void loginDoesNotRevealWhetherEmailOrPasswordWasWrong() {
        User user = new User();
        user.setEmail("person@example.com");
        user.setPasswordHash("hashed");
        when(users.findByEmailIgnoreCase("person@example.com")).thenReturn(Optional.of(user));
        when(passwords.matches("wrong-pass", "hashed")).thenReturn(false);

        assertThatThrownBy(() -> service.login(
                new AuthController.AuthRequest("person@example.com", "wrong-pass")))
                .isInstanceOfSatisfying(ApiException.class, exception -> {
                    assertThat(exception.getStatus()).isEqualTo(HttpStatus.UNAUTHORIZED);
                    assertThat(exception.getMessage()).isEqualTo("Invalid email or password");
                });
    }
}