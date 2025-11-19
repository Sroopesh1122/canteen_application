package com.sr.app.services;

import com.sr.app.dto.UserDto;

public interface IUserService {

	public UserDto getById(String userId);
	
	public UserDto getByEmail(String email);
	
	
}
