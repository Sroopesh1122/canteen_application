package com.sr.app.services;

import java.util.Date;
import java.util.Map;

import javax.crypto.SecretKey;

import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;

@Service
public class JwtService {

    // Use a long, random secret key — same length as in JwtUtil
    private static final SecretKey SECRET_KEY = Keys.hmacShaKeyFor(
            "fgthhjcvdfbvmbfgyuguyuydvbkfdbkjvbdkjfbvkjfdbvkjfdd".getBytes()
    );

    // Token validity (e.g., 2 days)
    private static final long EXPIRATION_TIME_MS = 1000 * 60 * 60 * 24 * 2;

    /**
     * Generate token with email (subject) and optional custom claims
     */
    public String generateToken(String email, Map<String, Object> extraClaims) {
        Date now = new Date();
        Date expiry = new Date(now.getTime() + EXPIRATION_TIME_MS);

        return Jwts.builder()
                .setClaims(extraClaims)
                .setSubject(email)
                .setIssuedAt(now)
                .setExpiration(expiry)
                .signWith(SECRET_KEY, SignatureAlgorithm.HS256)
                .compact();
    }

    /**
     * Overloaded: Generate token without extra claims
     */
    public String generateToken(String email) {
        return generateToken(email, Map.of());
    }

    /**
     * Extract email (subject) from JWT
     */
    public String extractEmail(String token) {
        return extractAllClaims(token).getSubject();
    }

    /**
     * Extract all claims from JWT
     */
    public Claims extractAllClaims(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(SECRET_KEY)
                .build()
                .parseClaimsJws(token)
                .getBody();
    }

    /**
     * Validate token against user details
     */
    public boolean validateToken(String token, UserDetails userDetails) {
        String email = extractEmail(token);
        
        UserDetailsImpl userDetailsImpl = (UserDetailsImpl) userDetails;
        
        return (email.equals(userDetailsImpl.getUser().getEmail()) && !isTokenExpired(token));
    }

    /**
     * Check if token is expired
     */
    private boolean isTokenExpired(String token) {
        Date expiration = extractAllClaims(token).getExpiration();
        return expiration.before(new Date());
    }
}
