//package com.sr.app.config;
//
//import jakarta.servlet.http.HttpServletRequest;
//import jakarta.servlet.http.HttpServletResponse;
//import org.springframework.security.web.AuthenticationEntryPoint;
//import org.springframework.stereotype.Component;
//
//import java.io.IOException;
//
//@Component
//public class JwtAuthEntryPoint implements AuthenticationEntryPoint {
//    @Override
//    public void commence(HttpServletRequest request, HttpServletResponse response,
//                         org.springframework.security.core.AuthenticationException authException) throws IOException {
//        response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
//        response.setContentType("application/json");
//        response.getWriter().write("{\"error\": \"Unauthorized - Invalid or missing token\"}");
//    }
//}




//For Hmlt return

package com.sr.app.config;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.core.io.ClassPathResource;
import org.springframework.security.web.AuthenticationEntryPoint;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.nio.file.Files;

@Component
public class JwtAuthEntryPoint implements AuthenticationEntryPoint {

    @Override
    public void commence(HttpServletRequest request,
                         HttpServletResponse response,
                         org.springframework.security.core.AuthenticationException authException) throws IOException {

        response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
        response.setContentType("text/html; charset=UTF-8");

        // Load HTML file from /static/unauthorized.html
        var htmlFile = new ClassPathResource("static/unauthorized.html");

        if (htmlFile.exists()) {
            String html = new String(Files.readAllBytes(htmlFile.getFile().toPath()));
            response.getWriter().write(html);
        } else {
            // fallback
            response.getWriter().write("<html><body><h2>401 - Unauthorized</h2><p>You must log in to access this page.</p></body></html>");
        }
    }
}
