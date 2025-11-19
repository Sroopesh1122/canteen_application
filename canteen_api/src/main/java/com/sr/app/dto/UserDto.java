package com.sr.app.dto;

import java.time.LocalDateTime;

import lombok.Data;

@Data
public class UserDto {
	
    private String userId;
	
	private String name;
	
	private String email;
	
	private LocalDateTime createdAt;
	
	private LocalDateTime updatedAt;

}
