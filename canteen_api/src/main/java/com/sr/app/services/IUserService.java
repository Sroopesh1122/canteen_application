package com.sr.app.services;

import org.springframework.data.domain.Page;

import com.sr.app.dto.UserDto;

public interface IUserService {

	public UserDto getById(String userId);
	
	public UserDto getByEmail(String email);
	
	public Page<UserDto> getUsers(String searchText,Integer page,Integer limit);
	
	
}
