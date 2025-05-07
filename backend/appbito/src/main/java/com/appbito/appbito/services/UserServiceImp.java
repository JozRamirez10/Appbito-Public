package com.appbito.appbito.services;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.appbito.appbito.entities.User;
import com.appbito.appbito.entities.UserDTO;
import com.appbito.appbito.repositories.UserRepository;

@Service
public class UserServiceImp implements UserService{

    @Autowired
    private UserRepository repository;

    @Autowired
    private EmailService emailService;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Override
    @Transactional(readOnly = true)
    public List<User> findAll() {
        return (List<User>) this.repository.findAll();
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<UserDTO> findById(Long id) {
        Optional<User> userOptional = this.repository.findById(id);
        if(userOptional.isPresent()){
            return Optional.of(
                userToUserDTO(userOptional.orElseThrow())
            );
        }
        return Optional.empty();
    }

    @Override
    @Transactional
    public User save(User user) {
        String token = UUID.randomUUID().toString();
        String email = user.getEmail();

        user.setPassword(passwordEncoder.encode(user.getPassword()));
        user.setVerificationToken(token);
        user.setEnabled(false);

        this.emailService.sendVerificationEmail(email, token);
        
        return this.repository.save(user);
    }

    @Override
    public Optional<UserDTO> saveImage(String email, String image) {
        Optional<User> userOptional = this.repository.findByEmail(email);
        if(userOptional.isPresent()){
            User userBD = userOptional.orElseThrow();
            userBD.setImage(image);
            return Optional.of(userToUserDTO(this.repository.save(userBD)));
        }
        return Optional.empty();
    }

    @Override
    public Optional<User> updateRegister(User user) {
        user.setEnabled(true);
        user.setVerificationToken(null);
        return Optional.of(this.repository.save(user));
    }

    @Override
    @Transactional
    public Optional<UserDTO> update(UserDTO user, Long id) {
        Optional<User> userOptional = this.repository.findById(id);
        if(userOptional.isPresent()){
            User userBD = userOptional.orElseThrow();
            userBD.setName(user.getName());
            userBD.setLastname(user.getLastname());
            userBD.setDate(user.getDate());
            userBD.setEmail(user.getEmail());
            return Optional.of(userToUserDTO(this.repository.save(userBD)));
        }
        return Optional.empty();
    }

    @Override
    @Transactional
    public Optional<UserDTO> updatePassword(Long id, String oldPassword, String newPassword) {
        Optional<User> userOptional = this.repository.findById(id);
        if(userOptional.isPresent()){
            User userBD = userOptional.orElseThrow();
            if(this.passwordEncoder.matches(oldPassword, userBD.getPassword())){
                userBD.setPassword(this.passwordEncoder.encode(newPassword));
                return Optional.of(userToUserDTO(this.repository.save(userBD)));
            }
        }
        return Optional.empty();
    }

    @Override
    @Transactional
    public void deleteById(Long id) {
        this.repository.deleteById(id);
    }

    @Override
    @Transactional(readOnly = true)
    public boolean existsById(Long id) {
        return this.repository.existsById(id);
    }

    @Override
    @Transactional(readOnly = true)
    public boolean existsByEmail(String email) {
        return this.repository.existsByEmail(email);
    }

    @Override
    @Transactional(readOnly = true)
    public boolean existsByEmailAndId(String email, Long id) {
        return this.repository.existsByEmailAndId(email, id);
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<User> findByIdAndPassword(Long id, String password) {
        Optional<User> userOptional = this.repository.findById(id);
        if(userOptional.isPresent()){
            User userBD = userOptional.orElseThrow();
            if(this.passwordEncoder.matches(password, userBD.getPassword())){
                return Optional.of(userBD);
            }else{
                throw new IllegalArgumentException("Password not matches");
            }
        }
        return Optional.empty();
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<User> findByVerificationToken(String token) {
        return this.repository.findByVerificationToken(token);
    }

    private UserDTO userToUserDTO(User user){
        UserDTO userDTO = new UserDTO();
        
        userDTO.setId(user.getId());
        userDTO.setName(user.getName());
        userDTO.setLastname(user.getLastname());
        userDTO.setDate(user.getDate());
        userDTO.setEmail(user.getEmail());
        userDTO.setImage(user.getImage());
        
        return userDTO;
    }

}
