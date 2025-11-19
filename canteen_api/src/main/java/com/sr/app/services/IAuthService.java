package com.sr.app.services;

import com.sr.app.request.UserSigninRequest;
import com.sr.app.request.UserSignupRequest;
import com.sr.app.response.TokenResponse;

public interface IAuthService {
	
	public TokenResponse userSignIn(UserSigninRequest request);
	
	public TokenResponse userSignup(UserSignupRequest request);

}
