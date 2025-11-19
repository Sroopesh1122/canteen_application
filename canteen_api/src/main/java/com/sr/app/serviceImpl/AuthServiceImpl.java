package com.sr.app.serviceImpl;

import java.util.HashMap;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.sr.app.constants.UserConstants;
import com.sr.app.exception.AppException;
import com.sr.app.models.Users;
import com.sr.app.request.UserSigninRequest;
import com.sr.app.request.UserSignupRequest;
import com.sr.app.response.TokenResponse;
import com.sr.app.respos.UserRepo;
import com.sr.app.services.IAuthService;
import com.sr.app.services.JwtService;
import com.sr.app.utils.IdGeneration;


@Service
public class AuthServiceImpl implements IAuthService {

	@Autowired
	private UserRepo userRepo;
	
	@Autowired
	private PasswordEncoder passwordEncoder;
	
	@Autowired
	private JwtService jwtService;
	
	@Override
	public TokenResponse userSignIn(UserSigninRequest request) {
		
		Users user = userRepo.findByEmail(request.getEmail());
		
		if(user == null)
		{
			throw new AppException("User not found", HttpStatus.NOT_FOUND);
		}
		
		if(user.getPassword() ==null)
		{
			throw new AppException("Please login using google", HttpStatus.BAD_REQUEST);
		}
		
		if(!passwordEncoder.matches(request.getPassword(), user.getPassword()))
		{
			throw new AppException("Invalid Password", HttpStatus.BAD_REQUEST);
		}
		
		Map<String, Object> claims = new HashMap<>();
        claims.put("name", user.getName());
        claims.put("email", user.getEmail());
        claims.put("role", user.getRole());
        claims.put("userId", user.getUserId());

        String token = jwtService.generateToken(user.getEmail(), claims);
        
        TokenResponse response = new TokenResponse();
        response.setRole(user.getRole().toUpperCase());
        response.setToken(token);

		return response;
	}

	@Override
	public TokenResponse userSignup(UserSignupRequest request) {
         
		Users user = userRepo.findByEmail(request.getEmail());
		
		if(user != null)
		{
			throw new AppException("Email Already exists", HttpStatus.NOT_FOUND);
		}
		
		Users newUser = new Users();
		newUser.setEmail(request.getEmail());
		newUser.setName(request.getName());
		newUser.setPassword(passwordEncoder.encode(request.getPassword()));
		newUser.setRole(UserConstants.CUSTOMER);
		newUser.setUserId(IdGeneration.generateRandomString());
		
		newUser = userRepo.save(newUser);
		
		Map<String, Object> claims = new HashMap<>();
        claims.put("name", newUser.getName());
        claims.put("email", newUser.getEmail());
        claims.put("role", newUser.getRole());
        claims.put("userId", newUser.getUserId());

        String token = jwtService.generateToken(newUser.getEmail(), claims);

        TokenResponse response = new TokenResponse();
        response.setRole(newUser.getRole().toUpperCase());
        response.setToken(token);

		return response;
	
		
	}

}
