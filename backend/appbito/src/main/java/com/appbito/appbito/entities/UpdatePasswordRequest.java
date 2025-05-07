package com.appbito.appbito.entities;

import jakarta.validation.constraints.NotBlank;

public class UpdatePasswordRequest {

    @NotBlank(message = "Must not be empty")
    private String oldPassword;

    @NotBlank(message = "Must not be empty")
    private String newPassword;

    public UpdatePasswordRequest() {
    }

    public String getOldPassword() {
        return oldPassword;
    }

    public void setOldPassword(String oldPassword) {
        this.oldPassword = oldPassword;
    }

    public String getNewPassword() {
        return newPassword;
    }

    public void setNewPassword(String newPasword) {
        this.newPassword = newPasword;
    }

}
