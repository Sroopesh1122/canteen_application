package com.sr.app.rest;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.sr.app.dto.UserDto;
import com.sr.app.mapper.Mapper;
import com.sr.app.response.ApiResponse;
import com.sr.app.services.IUserService;
import com.sr.app.services.UserDetailsImpl;
import org.springframework.web.bind.annotation.RequestParam;


@RestController
@RequestMapping("/api/v1/user")
public class UserController {
	
	@Autowired
	private IUserService userService;
	
	@Autowired
	private Mapper mapper;
	
	
	@GetMapping("/secure/auth/profile")
	public ResponseEntity<?> getUserProfile(@AuthenticationPrincipal UserDetailsImpl userDetailsImpl)
	{
		UserDto userDto = mapper.toDto(userDetailsImpl.getUser());
		
		return ResponseEntity.ok(new ApiResponse<>("success","Profile Data", userDto));
		
	}
	
	@GetMapping("/secure/")
	public ResponseEntity<?> getUsers(
			@RequestParam(required = false) String q,
			@RequestParam(required = false,defaultValue = "0") Integer page,
			@RequestParam(required = false,defaultValue = "10") Integer limit) {
		return ResponseEntity.ok(new ApiResponse<>("success","Users Data", userService.getUsers(q, page, limit)));
	}
	
	

}
