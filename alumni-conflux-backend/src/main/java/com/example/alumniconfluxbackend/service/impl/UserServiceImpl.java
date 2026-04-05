package com.example.alumniconfluxbackend.service.impl;

import com.example.alumniconfluxbackend.model.User;
import com.example.alumniconfluxbackend.repository.UserRepository;
import com.example.alumniconfluxbackend.service.UserService;
import jakarta.transaction.Transactional;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
@Transactional
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public UserServiceImpl(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public User registerUser(User user) {
        return userRepository.save(user);
    }

    @Override
    public boolean usernameExists(String username) {
        return userRepository.existsByUsername(username);
    }

    @Override
    public boolean emailExists(String email) {
        return userRepository.existsByEmail(email);
    }

    @Override
    public Optional<User> findByEmailAndUsername(String emailOrUsername) {
        Optional<User> user = userRepository.findByEmail(emailOrUsername);
        if (user.isPresent()) return user;
        return userRepository.findByUsername(emailOrUsername);
    }

    @Override
    public Optional<User> findByEmail(String email) {
        return userRepository.findByEmail(email);
    }

    @Override
    public void updatePassword(User user, String newPassword) {
        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);
    }

    @Override
    public void updateProfilePicture(Integer userId, String imageUrl) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        if (user.getStudent() != null) {
            user.getStudent().setProfilePicture(imageUrl);
        } else if (user.getAlumni() != null) {
            user.getAlumni().setProfilePicture(imageUrl);
        } else {
            throw new IllegalArgumentException("Associated profile not found for user");
        }
        userRepository.save(user);
    }
}
