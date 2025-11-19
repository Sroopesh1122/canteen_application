package com.sr.app.config;

import java.util.Arrays;

import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import com.sr.app.filter.JwtFilter;
import com.sr.app.oauth.CustomOAuth2SuccessHandler;

@Configuration
public class Config {
	
	
	@Autowired
	private CustomOAuth2SuccessHandler oAuth2SuccessHandler;
	
	
	@Autowired
	private JwtFilter jwtFilter;
	
	@Autowired
	private JwtAuthEntryPoint jwtAuthEntryPoint;

	@Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {

        http
            .csrf(csrf -> csrf.disable())
            .cors(cors->cors.configurationSource(corsConfigurationSource()))
            .authorizeHttpRequests(auth -> auth
                // Signup & Login endpoints open
                .requestMatchers(
                		"/api/v1/auth/**",
                		"/api/v1/category/public/**",
                		"/api/v1/menu-item/public/**",
                		"/api/v1/orders/public/**").permitAll()
                // OAuth2 related URLs open
                .requestMatchers("/oauth2/**").permitAll()
                // Swagger docs open
                .requestMatchers("/v3/api-docs/**", "/swagger-ui/**", "/swagger-ui.html").permitAll()
                // All other APIs secured
                .anyRequest().authenticated()
            )
            .exceptionHandling(e -> e.authenticationEntryPoint(jwtAuthEntryPoint))

            // OAuth2 Login (Google)
            .oauth2Login(oauth -> oauth
                .successHandler(oAuth2SuccessHandler)
            )

            // Stateless session management for JWT
            .sessionManagement(session -> 
                session.sessionCreationPolicy(SessionCreationPolicy.STATELESS)
            )

            // Add custom JWT filter before username-password filter
            .addFilterBefore(jwtFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }
	
	@Bean
	public CorsConfigurationSource corsConfigurationSource() {
	    CorsConfiguration corsConfiguration = new CorsConfiguration();
	    corsConfiguration.addAllowedOriginPattern("*"); // Accept requests from any origin/device
	    corsConfiguration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS","PATCH"));
	    corsConfiguration.setAllowedHeaders(Arrays.asList("Authorization", "Content-Type", "X-Requested-With"));
	    corsConfiguration.setAllowCredentials(true); // Allow credentials (cookies, auth headers)

	    UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
	    source.registerCorsConfiguration("/**", corsConfiguration);
	    return source;
	}
    
    
    @Bean
    public PasswordEncoder passwordEncoder()
    {
    	return new BCryptPasswordEncoder();
    }
    
    @Bean
    public ModelMapper modelMapper()
    {
    	return new ModelMapper();
    }
    
}
