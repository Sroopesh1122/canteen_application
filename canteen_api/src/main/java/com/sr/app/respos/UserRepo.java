package com.sr.app.respos;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import com.sr.app.models.Users;

public interface UserRepo extends JpaRepository<Users, String> {
	
	Users findByEmail(String email);
	
	@Query("""
		       SELECT u 
		       FROM Users u 
		       WHERE u.role = 'CUSTOMER' AND (:q IS NULL 
		              OR :q = '' 
		              OR LOWER(u.name) LIKE LOWER(CONCAT(:q, '%')) 
		              OR LOWER(u.email) LIKE LOWER(CONCAT(:q, '%')))
		       """)
		Page<Users> findUserBySearchText(String q, Pageable pageable);


}
