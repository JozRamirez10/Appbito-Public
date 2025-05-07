package com.appbito.appbito.services;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.appbito.appbito.entities.CustomUserDetails;
import com.appbito.appbito.entities.UserCredentialsDTO;
import com.appbito.appbito.repositories.UserRepository;

@Service
public class UserJpaDetailsService implements UserDetailsService{

    @Autowired  
    private UserRepository repository;

    @Override
    @Transactional(readOnly = true)
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        UserCredentialsDTO user = this.repository.findCredentialsByEmail(email)
            .orElseThrow( () -> new UsernameNotFoundException("User not found"));
        
        if(!user.isEnabled()){
            throw new IllegalArgumentException("You must verify your account");
        }
        
        return new CustomUserDetails(user.getId(), user.getEmail(), user.getPassword());
    }
}
