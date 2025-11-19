package com.sr.app.request;

import lombok.Data;

@Data
public class CreateUserRequest {

	private String email;
	
	private String password;
	
	private String name;
	
	
}
