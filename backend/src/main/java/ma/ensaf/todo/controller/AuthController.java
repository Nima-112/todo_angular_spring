package ma.ensaf.todo.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import jakarta.validation.constraints.NotBlank;
import ma.ensaf.todo.entity.User;
import ma.ensaf.todo.repository.UserRepository;
import ma.ensaf.todo.security.JwtService;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    public record AuthRequest(@NotBlank String username, @NotBlank String password) {}
    public record AuthResponse(String token) {}

    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@RequestBody AuthRequest req) {
        if (userRepository.existsByUsername(req.username())) {
            return ResponseEntity.badRequest().build();
        }
        User u = new User();
        u.setUsername(req.username());
        u.setPassword(passwordEncoder.encode(req.password()));
        u.setRole("USER");
        userRepository.save(u);
        String token = jwtService.generateToken(u.getUsername(), 3600 * 24);
        return ResponseEntity.ok(new AuthResponse(token));
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@RequestBody AuthRequest req) {
        var u = userRepository.findByUsername(req.username()).orElse(null);
        if (u == null || !passwordEncoder.matches(req.password(), u.getPassword())) {
            return ResponseEntity.status(401).build();
        }
        String token = jwtService.generateToken(u.getUsername(), 3600 * 24);
        return ResponseEntity.ok(new AuthResponse(token));
    }
}
