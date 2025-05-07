package com.appbito.appbito.controllers;

import static com.appbito.appbito.auth.TokenJwtConfig.HEADER_AUTHORIZATION;
import static com.appbito.appbito.auth.TokenJwtConfig.PREFIX_TOKEN;
import static com.appbito.appbito.auth.TokenJwtConfig.SECRET_KEY;

import java.util.Date;
import java.util.Map;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CookieValue;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.appbito.appbito.entities.User;
import com.appbito.appbito.services.UserService;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletResponse;

@RestController
@RequestMapping("/auth")
public class AuthController {

    @Autowired
    private UserService userService;

    @PostMapping("/refresh")
    public ResponseEntity<?> refreshToken(@CookieValue(value = "refresh_token", required = false) String refreshToken,
        HttpServletResponse response){
        
        if(refreshToken == null){
            System.out.println("Refresh token is null");
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "Refresh token is missing"));
        }

        System.out.println("Refresh token recibed: " + refreshToken);

        try{
            Claims claims = Jwts.parser()
                .verifyWith(SECRET_KEY)
                .build()
                .parseSignedClaims(refreshToken)
                .getPayload();
            
            String userId = claims.getSubject();

            String newAccessToken = Jwts.builder()
                .subject(userId)
                .signWith(SECRET_KEY)
                .expiration(new Date(System.currentTimeMillis() + 15 * 60 * 1000)) // minutes * seconds * miliseconds
                .compact();

            return ResponseEntity.ok()
                .header(HEADER_AUTHORIZATION, PREFIX_TOKEN + newAccessToken)
                .build();
        
        }catch(JwtException e){
            System.out.println(e);
            Cookie cookieRevocked = cookieExpiration("refresh_token");
            response.addCookie(cookieRevocked);
            System.out.println("Return cookie revocked");
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "Invalid refresh token"));
        }
    }

    @PostMapping("/logout")
    public ResponseEntity<?> logout(HttpServletResponse response){
        Cookie refreshCookie = cookieExpiration("refresh_token");
        response.addCookie(refreshCookie);
        return ResponseEntity.ok(Map.of("message", "Logout success"));
    }

    @GetMapping("/verify")
    public ResponseEntity<?> verifyAccount(@RequestParam("token") String token){
        Optional<User> userOptional = this.userService.findByVerificationToken(token);
        if(userOptional.isPresent()){
            User userBD = userOptional.orElseThrow();
            userBD.setEnabled(true);
            userBD.setVerificationToken(null);
            this.userService.updateRegister(userBD);
            return ResponseEntity.ok(Map.of("message", "Account verified successfully"));
        }
        return ResponseEntity.notFound().build();
    }

    private Cookie cookieExpiration(String nameCookie){
        Cookie cookie = new Cookie(nameCookie, "");
        cookie.setHttpOnly(true);
        cookie.setPath("/");
        cookie.setMaxAge(0);
        return cookie;

    }
}
