package com.sr.app.services;

import java.util.Collection;
import java.util.Collections;
import java.util.List;

import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;

import com.sr.app.models.Users;


public class UserDetailsImpl implements UserDetails {
	

	private static final long serialVersionUID = 1L;
	
	
	private Users user;
	
	public UserDetailsImpl(Users user) {
		// TODO Auto-generated constructor stub
		this.user = user;
	}
	
	public Users getUser()
	{
		return user;
	}
	

	@Override
	public Collection<? extends GrantedAuthority> getAuthorities() {
		 String role = user.getRole();
	        if (role == null || role.trim().isEmpty()) {
	            return Collections.emptyList();
	        }
	        // Convert role to GrantedAuthority
	        return List.of(new SimpleGrantedAuthority("ROLE_" + role.toUpperCase()));
	}

	@Override
	public String getPassword() {
		// TODO Auto-generated method stub
		return null;
	}

	@Override
	public String getUsername() {
		// TODO Auto-generated method stub
		return null;
	}

}
