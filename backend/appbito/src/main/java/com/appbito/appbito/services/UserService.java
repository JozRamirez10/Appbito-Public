package com.appbito.appbito.services;

import java.util.List;
import java.util.Optional;

import com.appbito.appbito.entities.User;
import com.appbito.appbito.entities.UserDTO;

public interface UserService {
    List<User> findAll();
    Optional<UserDTO> findById(Long id);
    User save(User user);
    Optional<UserDTO> saveImage(String email, String image);
    Optional<UserDTO> update(UserDTO user, Long id);
    void deleteById(Long id);

    boolean existsById(Long id);
    boolean existsByEmail(String email);
    boolean existsByEmailAndId(String email, Long id);

    Optional<User> findByIdAndPassword(Long id, String password);
    Optional<UserDTO> updatePassword(Long id, String oldPassword, String newPassword);
    
    Optional<User> findByVerificationToken(String token);
    Optional<User> updateRegister(User user);
}
