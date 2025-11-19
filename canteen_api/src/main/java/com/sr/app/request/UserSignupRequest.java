package com.sr.app.request;

import lombok.Data;

@Data
public class UserSignupRequest {

	private String name;
	
	private String email;
	
	private String password;
	
}
