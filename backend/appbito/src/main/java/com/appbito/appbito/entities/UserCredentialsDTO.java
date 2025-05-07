package com.appbito.appbito.entities;

public class UserCredentialsDTO {

    private Long id;
    
    private String email;

    private String password;

    private boolean enabled;

    public UserCredentialsDTO(Long id, String email, String password, boolean enabled) {
        this.id = id;
        this.email = email;
        this.password = password;
        this.enabled = enabled;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public boolean isEnabled() {
        return enabled;
    }

    public void setEnabled(boolean enabled) {
        this.enabled = enabled;
    }
    
    
}
