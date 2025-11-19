package com.sr.app.exception;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;


@RestControllerAdvice
public class CustomExceptionHandler {

	
	@ExceptionHandler(AppException.class)
	 public ResponseEntity<Map<String, Object>> handleException(AppException exception) {
        Map<String,Object> errorResponse = new HashMap<>();
        errorResponse.put("status", "failure");
        errorResponse.put("type","Auth Exception");
        errorResponse.put("error", exception.getMessage());
        errorResponse.put("localTime", LocalDateTime.now());
        return new ResponseEntity<Map<String,Object>>(errorResponse, exception.getHttpStatus());
    }
	
	@ExceptionHandler(UsernameNotFoundException.class)
	 public ResponseEntity<Map<String, Object>> handleException(UsernameNotFoundException exception) {
       Map<String,Object> errorResponse = new HashMap<>();
       errorResponse.put("status", "failure");
       errorResponse.put("type","Auth Exception");
       errorResponse.put("error", "User not found");
       errorResponse.put("localTime", LocalDateTime.now());
       return new ResponseEntity<Map<String,Object>>(errorResponse, HttpStatus.UNAUTHORIZED);
   }
	
	
}
