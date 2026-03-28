package com.finio.dto;

public class InviteRequest {
    private String email;
    private String role; // ADMIN or MEMBER

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }
}
