package com.appbito.appbito.repositories;

import java.util.Optional;

import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.CrudRepository;
import org.springframework.data.repository.query.Param;

import com.appbito.appbito.entities.User;
import com.appbito.appbito.entities.UserCredentialsDTO;

public interface UserRepository extends CrudRepository<User, Long>{

    @Query("SELECT new com.appbito.appbito.entities.UserCredentialsDTO(u.id, u.email, u.password, u.enabled) FROM User u WHERE u.email = :email")
    Optional<UserCredentialsDTO> findCredentialsByEmail(@Param("email") String email);
    
    Optional<User> findByEmail(String email);

    Optional<User> findByVerificationToken(String token);

    @SuppressWarnings("null")
    boolean existsById(Long id);

    boolean existsByEmail(String email);

    boolean existsByEmailAndId(String email, Long id);
}
