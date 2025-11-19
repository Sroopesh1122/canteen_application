package com.sr.app.models;

import java.time.LocalDateTime;

import com.sr.app.constants.UserConstants;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import lombok.Data;


@Data
@Entity
public class Users {
	
	@Id
	private String userId;
	
	private String name;
	
	private String email;
	
	private String password;
	
	private String role = UserConstants.CUSTOMER;
	
	private LocalDateTime createdAt = LocalDateTime.now();
	
	private LocalDateTime updatedAt;

}
