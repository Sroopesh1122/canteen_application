package com.sr.app.respos;

import org.springframework.data.jpa.repository.JpaRepository;

import com.sr.app.models.Users;

public interface UserRepo extends JpaRepository<Users, String> {
	
	Users findByEmail(String email);

}
