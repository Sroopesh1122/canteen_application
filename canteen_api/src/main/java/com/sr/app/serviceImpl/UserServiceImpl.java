package com.sr.app.serviceImpl;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import com.sr.app.dto.UserDto;
import com.sr.app.mapper.Mapper;
import com.sr.app.respos.UserRepo;
import com.sr.app.services.IUserService;

@Service
public class UserServiceImpl implements IUserService {

	
	@Autowired
	private UserRepo userRepo;
	
	@Autowired
	private Mapper mapper;
	

	@Override
	public UserDto getById(String userId) {
		return null;
	}

	@Override
	public UserDto getByEmail(String email) {
		// TODO Auto-generated method stub
		return null;
	}
	
	@Override
	public Page<UserDto> getUsers(String searchText, Integer page, Integer limit) {
		
		
		Pageable pageable = PageRequest.of(page, limit,Sort.by("createdAt").descending());
		return userRepo.findUserBySearchText(searchText, pageable).map(u->mapper.toDto(u));
	}

}
