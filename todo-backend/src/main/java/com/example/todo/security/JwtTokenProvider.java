package com.example.todo.security;

import com.example.todo.model.User;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.security.Key;
import java.util.Date;

@Component
public class JwtTokenProvider {
    private static final Logger logger = LoggerFactory.getLogger(JwtTokenProvider.class);

    @Value("${app.jwt.secret}")
    private String jwtSecret;

    @Value("${app.jwt.expiration}")
    private int jwtExpirationInMs;

    private Key getSigningKey() {
        try {
        byte[] keyBytes = Decoders.BASE64.decode(jwtSecret);
    return Keys.hmacShaKeyFor(keyBytes);
        } catch (Exception e) {
            logger.error("Error creating signing key: {}", e.getMessage(), e);
            throw new RuntimeException("Error creating signing key", e);
        }
    }

    public String generateToken(User user) {
        try {
            logger.debug("Generating JWT token for user: {}", user.getEmail());
            
            Date now = new Date();
            Date expiryDate = new Date(now.getTime() + jwtExpirationInMs);

            String token = Jwts.builder()
                    .setSubject(user.getEmail())
                    .setIssuedAt(new Date())
                    .setExpiration(expiryDate)
                    .claim("userId", user.getId())
                    .claim("name", user.getName())
                    .claim("isAdmin", user.isAdmin())
                    .signWith(getSigningKey(), SignatureAlgorithm.HS512)
                    .compact();
            
            logger.debug("JWT token generated successfully");
            return token;
        } catch (Exception e) {
            logger.error("Error generating JWT token: {}", e.getMessage(), e);
            throw new RuntimeException("Error generating JWT token", e);
        }
    }

    public String getUserEmailFromToken(String token) {
        try {
            logger.debug("Extracting user email from token");
            
            Claims claims = Jwts.parserBuilder()
                    .setSigningKey(getSigningKey())
                    .build()
                    .parseClaimsJws(token)
                    .getBody();

            String email = claims.getSubject();
            logger.debug("User email extracted from token: {}", email);
            return email;
        } catch (Exception e) {
            logger.error("Error extracting user email from token: {}", e.getMessage(), e);
            throw new RuntimeException("Error extracting user email from token", e);
        }
    }

    public boolean validateToken(String token) {
        try {
            logger.debug("Validating JWT token");
            Jwts.parserBuilder()
                    .setSigningKey(getSigningKey())
                    .build()
                    .parseClaimsJws(token);
            logger.debug("JWT token is valid");
            return true;
        } catch (Exception e) {
            logger.error("JWT token validation failed: {}", e.getMessage(), e);
            return false;
        }
    }
}
