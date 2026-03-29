package com.example.alumniconfluxbackend.service;

import com.example.alumniconfluxbackend.model.User;

import java.util.Optional;

public interface UserService {
    User registerUser(User user);
    boolean usernameExists(String username);
    boolean emailExists(String email);

    Optional<User> findByEmailAndUsername(String emailOrUsername);

    Optional<User> findByEmail(String email);
    void updatePassword(User user, String newPassword);
}
