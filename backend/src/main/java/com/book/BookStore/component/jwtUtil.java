package com.book.BookStore.component;

import java.util.Date;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;

@Component
public class jwtUtil {
    @Value("${jwt.secret:mysecretkeymysecretkeymysecretkey}")
    private String secretKey;

    @Value("${jwt.expiration.ms:3600000}")
    private long expirationMs;

    public String generateToken(String email) {
        byte[] signingKey = secretKey.getBytes();
        return Jwts.builder().setSubject(email).setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + expirationMs))
                .signWith(Keys.hmacShaKeyFor(signingKey), SignatureAlgorithm.HS256).compact();
    }

    public String extractEmail(String token) {
        byte[] signingKey = secretKey.getBytes();
        return Jwts.parserBuilder().setSigningKey(signingKey).build()
                .parseClaimsJws(token).getBody().getSubject();

    }

    public boolean validateToken(String token, String email) {
        return extractEmail(token).equals(email);

    }

}
