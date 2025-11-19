package com.sr.app.rest;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.sr.app.request.UserSigninRequest;
import com.sr.app.request.UserSignupRequest;
import com.sr.app.response.ApiResponse;
import com.sr.app.response.TokenResponse;
import com.sr.app.services.IAuthService;


@RequestMapping("/api/v1/auth")
@RestController
public class AuthController {
	
	@Autowired
	private IAuthService authService;
	
	
	@PostMapping("/signin")
	public ResponseEntity<?> userSignIn(@RequestBody UserSigninRequest request)
	{
		TokenResponse response = authService.userSignIn(request);
		
		return ResponseEntity.ok(new ApiResponse<>("success","User Signin Successfully",response));
		
	}
	
	
	@PostMapping("/signup")
	public ResponseEntity<?> userSignup(@RequestBody UserSignupRequest request)
	{
		TokenResponse response = authService.userSignup(request);
		
		return ResponseEntity.ok(new ApiResponse<>("success","User Signup Successfully",response));
		
	}
	
	
	

}
