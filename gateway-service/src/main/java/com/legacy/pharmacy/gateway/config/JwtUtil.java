package com.legacy.pharmacy.gateway.config;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Base64;  // ← AÑADIR IMPORT
import java.util.Date;
import java.util.function.Function;

@Component
public class JwtUtil {

    private static final Logger log = LoggerFactory.getLogger(JwtUtil.class);

    @Value("${jwt.secret}")
    private String secret;

    @Value("${jwt.expiration}")
    private Long expiration;

    // ⭐ CAMBIO CRÍTICO: Decodificar Base64 igual que MS-Usuarios
    private SecretKey getSigningKey() {
        byte[] keyBytes = Base64.getDecoder().decode(secret);  // ← DECODIFICAR BASE64
        return Keys.hmacShaKeyFor(keyBytes);
    }

    public Claims getAllClaimsFromToken(String token) {
        return Jwts.parser()
                .verifyWith(getSigningKey())
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }

    public <T> T getClaimFromToken(String token, Function<Claims, T> claimsResolver) {
        final Claims claims = getAllClaimsFromToken(token);
        return claimsResolver.apply(claims);
    }

    public String getUsernameFromToken(String token) {
        return getClaimFromToken(token, Claims::getSubject);
    }

    public Date getExpirationDateFromToken(String token) {
        return getClaimFromToken(token, Claims::getExpiration);
    }

    private Boolean isTokenExpired(String token) {
        final Date expiration = getExpirationDateFromToken(token);
        return expiration.before(new Date());
    }

    public Boolean validateToken(String token) {
        try {
            boolean isValid = !isTokenExpired(token);

            if (isValid) {
                log.debug("Token válido para usuario: {}", getUsernameFromToken(token));
            } else {
                log.warn("Token expirado");
            }

            return isValid;
        } catch (Exception e) {
            log.error("Error validando token: {}", e.getMessage());
            return false;
        }
    }

    public String getRoleFromToken(String token) {
        Claims claims = getAllClaimsFromToken(token);
        String role = claims.get("rol", String.class);
        if (role == null) {
            role = claims.get("role", String.class);
        }
        log.debug("Rol extraído del token: {}", role);
        return role;
    }

    public Long getUserIdFromToken(String token) {
        Claims claims = getAllClaimsFromToken(token);
        Object userId = claims.get("userId");
        if (userId == null) {
            userId = claims.get("usuarioId");
        }
        if (userId != null) {
            Long id = Long.valueOf(userId.toString());
            log.debug("Usuario ID extraído del token: {}", id);
            return id;
        }
        log.warn("No se encontró userId ni usuarioId en el token");
        return null;
    }
}