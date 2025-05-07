package com.appbito.appbito.auth.filter;

import java.io.IOException;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;

import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

import com.appbito.appbito.entities.CustomUserDetails;
import com.appbito.appbito.entities.User;
import com.fasterxml.jackson.core.exc.StreamReadException;
import com.fasterxml.jackson.databind.DatabindException;
import com.fasterxml.jackson.databind.ObjectMapper;

import io.jsonwebtoken.Jwts;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import static com.appbito.appbito.auth.TokenJwtConfig.*;

public class JwtAuthenticationFilter extends UsernamePasswordAuthenticationFilter{

    private AuthenticationManager authenticationManager;

    public JwtAuthenticationFilter(AuthenticationManager authenticationManager){
        this.authenticationManager = authenticationManager;
        setUsernameParameter("email");
    }
    
    @Override
    public Authentication attemptAuthentication(HttpServletRequest request, HttpServletResponse response)
            throws AuthenticationException {
        String email = null;
        String password = null;

        try{
            User user = new ObjectMapper().readValue(request.getInputStream(), User.class);
            email = user.getEmail();
            password = user.getPassword();
        } catch (StreamReadException e){
            e.printStackTrace();
        } catch (DatabindException e){
            e.printStackTrace();
        } catch (IOException e){
            e.printStackTrace();
        }

        UsernamePasswordAuthenticationToken authenticationToken 
            = new UsernamePasswordAuthenticationToken(email, password);

        return this.authenticationManager.authenticate(authenticationToken);
    }

    @Override
    protected void successfulAuthentication(HttpServletRequest request, HttpServletResponse response, FilterChain chain,
            Authentication authResult) throws IOException, ServletException {
        
        CustomUserDetails user = (CustomUserDetails) authResult.getPrincipal();
        
        Long userId = user.getId();

        String accessToken = Jwts.builder()
            .subject(userId.toString())
            .signWith(SECRET_KEY)
            .expiration(new Date(System.currentTimeMillis() + 15 * 60 * 1000)) // minutes * seconds * miliseconds
            .compact();
        
        String refreshToken = Jwts.builder()
            .subject(userId.toString())
            .signWith(SECRET_KEY)
            .expiration(new Date(System.currentTimeMillis() + 1 * 1440 * 60 * 1000)) // days * minutes * seconds * miliseconds 
            .compact();
        
        response.addHeader(HEADER_AUTHORIZATION, PREFIX_TOKEN + accessToken);

        Cookie refreshCookie = new Cookie("refresh_token", refreshToken);
        refreshCookie.setHttpOnly(true);
        refreshCookie.setPath("/");
        refreshCookie.setMaxAge(1 * 1440 * 60); // days * minutes * seconds 
        refreshCookie.setAttribute("SameSite", "Strict");
        response.addCookie(refreshCookie);

    }

    @Override
    protected void unsuccessfulAuthentication(HttpServletRequest request, HttpServletResponse response,
            AuthenticationException failed) throws IOException, ServletException {

        Map<String, String> body = new HashMap<>();

        if (failed.getCause() instanceof IllegalArgumentException && 
           "You must verify your account".equals(failed.getCause().getMessage())) {
            body.put("message", "You must verify your account");
        } else {
            body.put("message", "Email or password incorrect");
        }
        
        body.put("error", failed.getMessage());

        response.getWriter().write(new ObjectMapper().writeValueAsString(body));
        response.setContentType(CONTENT_TYPE);
        response.setStatus(401);
    } 

}
