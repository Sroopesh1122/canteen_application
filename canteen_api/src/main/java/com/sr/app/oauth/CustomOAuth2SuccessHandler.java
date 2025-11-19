//package com.sr.app.oauth;
//
//import com.fasterxml.jackson.databind.ObjectMapper;
//import com.sr.app.models.User;
//import com.sr.app.repo.UserRepo;
//import com.sr.app.service.JwtService;
//
//import org.springframework.beans.factory.annotation.Autowired;
//import org.springframework.security.core.Authentication;
//import org.springframework.security.oauth2.core.user.OAuth2User;
//import org.springframework.security.web.authentication.AuthenticationSuccessHandler;
//import org.springframework.stereotype.Component;
//
//import jakarta.servlet.http.HttpServletRequest;
//import jakarta.servlet.http.HttpServletResponse;
//
//import java.io.IOException;
//import java.net.URLEncoder;
//import java.nio.charset.StandardCharsets;
//import java.util.HashMap;
//import java.util.Map;
//
//@Component
//public class CustomOAuth2SuccessHandler implements AuthenticationSuccessHandler {
//
//    @Autowired
//    private UserRepo userRepo;
//
//    @Autowired
//    private JwtService jwtService;
//
//    @Override
//    public void onAuthenticationSuccess(HttpServletRequest request,
//                                        HttpServletResponse response,
//                                        Authentication authentication) throws IOException {
//
//        OAuth2User oAuth2User = (OAuth2User) authentication.getPrincipal();
//        String email = oAuth2User.getAttribute("email");
//        String name = oAuth2User.getAttribute("name");
//
//        if (email == null) {
//            response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
//            response.getWriter().write("{\"error\": \"Email not found in Google profile\"}");
//            return;
//        }
//
//        // Check if user already exists
//        User existingUser = userRepo.findByEmail(email);
//
//        User user;
//        if (existingUser !=null) {
//            user = existingUser;
//
//            // If user signed up with normal method, block Google login
//            if ("LOCAL".equalsIgnoreCase(user.getProvider())) {
//                response.setStatus(HttpServletResponse.SC_CONFLICT);
//                response.getWriter().write("{\"error\": \"Email already registered using normal signup\"}");
//                return;
//            }
//
//            // Else, it's a returning Google user, just continue
//        } else {
//            // Create new Google user
//            user = new User();
//            user.setEmail(email);
//            user.setName(name);
//            user.setProvider("GOOGLE");
//            userRepo.save(user);
//        }
//
//        // Generate JWT token
//        Map<String, Object> claims = new HashMap<>();
//        claims.put("provider", user.getProvider());
//        claims.put("name", user.getName());
//
//        String token = jwtService.generateToken(user.getEmail(), claims);
//
//        // Build response JSON
////        Map<String, Object> data = new HashMap<>();
////        data.put("token", token);
////        data.put("email", user.getEmail());
////        data.put("name", user.getName());
////        data.put("provider", user.getProvider());
////
////        response.setContentType("application/json");
////        response.setCharacterEncoding("UTF-8");
////        response.setStatus(HttpServletResponse.SC_OK);
////
////        new ObjectMapper().writeValue(response.getWriter(), data);
//        
//        String redirectUrl = "http://localhost:5173/oauth2-success?token=" + token +
//                "&email=" + URLEncoder.encode(user.getEmail(), StandardCharsets.UTF_8) +
//                "&name=" + URLEncoder.encode(user.getName(), StandardCharsets.UTF_8);
// 
//       response.sendRedirect(redirectUrl);
//
//    }
//}

package com.sr.app.oauth;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.AuthenticationSuccessHandler;
import org.springframework.stereotype.Component;

import com.sr.app.constants.UserConstants;
import com.sr.app.models.Users;
import com.sr.app.respos.UserRepo;
import com.sr.app.services.JwtService;
import com.sr.app.utils.IdGeneration;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.HashMap;
import java.util.Map;

@Component
public class CustomOAuth2SuccessHandler implements AuthenticationSuccessHandler {

    @Autowired
    private UserRepo userRepo;

    @Autowired
    private JwtService jwtService;

    @Value("${FRONT_END_URL}")
    private String frontendUrl;

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request,
                                        HttpServletResponse response,
                                        Authentication authentication) throws IOException {

        OAuth2User oAuth2User = (OAuth2User) authentication.getPrincipal();
        String email = oAuth2User.getAttribute("email");
        String name = oAuth2User.getAttribute("name");

        if (email == null) {
            response.sendRedirect(frontendUrl + "/login?error=missing_email");
            return;
        }

        Users user = userRepo.findByEmail(email);

        // Create user if not exists
        if (user == null) {
            user = new Users();
            user.setUserId(IdGeneration.generateRandomString());
            user.setEmail(email);
            user.setName(name);
            user.setRole(UserConstants.CUSTOMER);
            userRepo.save(user);
        }

        // Generate JWT token
        Map<String, Object> claims = new HashMap<>();
        claims.put("name", user.getName());
        claims.put("email", user.getEmail());
        claims.put("role", user.getRole());
        claims.put("userId", user.getUserId());

        String token = jwtService.generateToken(user.getEmail(), claims);

        // Redirect to frontend with token & user info
        String redirectUrl = String.format(
                "%s/auth/oauth2/success?token=%s&role=%s",
                frontendUrl,
                URLEncoder.encode(token, StandardCharsets.UTF_8),
                URLEncoder.encode(user.getRole(), StandardCharsets.UTF_8)
        );

        response.sendRedirect(redirectUrl);
    }
}
