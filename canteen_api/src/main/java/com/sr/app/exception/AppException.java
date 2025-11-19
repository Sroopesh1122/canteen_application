package com.sr.app.exception;

import org.springframework.http.HttpStatus;

import lombok.Data;

@Data
public class AppException extends RuntimeException {


	private static final long serialVersionUID = 1L;
	
	private String message;
	
	private HttpStatus  httpStatus;
	
	public AppException(String message , HttpStatus httpStatus) {
		// TODO Auto-generated constructor stub
		this.message = message;
		this.httpStatus = httpStatus;
	}
	

}
