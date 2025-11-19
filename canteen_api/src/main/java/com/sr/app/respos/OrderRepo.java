package com.sr.app.respos;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import com.sr.app.models.Orders;

public interface OrderRepo extends JpaRepository<Orders, String> {
	
	
	Orders findByRazorpayOrderId(String razorpayOrderId);
	
	
	@Query("SELECT o From Orders o where o.userId =:userId")
	Page<Orders> findByUser(String userId,Pageable pageable);

}
