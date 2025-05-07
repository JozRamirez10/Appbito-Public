package com.appbito.appbito.entities;

import io.jsonwebtoken.lang.Collections;

public class CustomUserDetails extends org.springframework.security.core.userdetails.User{

    private Long id;

    public CustomUserDetails(Long id, String email, String password){
        super(email, password, Collections.emptyList());
        this.id = id;
    }

    public Long getId(){
        return id;
    }
}