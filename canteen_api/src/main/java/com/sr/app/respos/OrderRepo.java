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
	
	@Query("SELECT o From Orders o where :status IS NULL OR o.status =:status")
	Page<Orders> findByStatus(String status,Pageable pageable);
	
	@Query("SELECT COUNT(o) From Orders o where :status IS NULL OR o.status =:status")
    Long countOrderByStatus(String status);
	
	@Query("""
		    SELECT COALESCE(SUM(o.totalAmount), 0)
		    FROM Orders o
		    WHERE o.status = 'DELIVERED'
		      AND MONTH(o.createdAt) = MONTH(CURRENT_DATE)
		      AND YEAR(o.createdAt) = YEAR(CURRENT_DATE)
		    """)
		Double getCurrentMonthIncome();
	
	@Query("""
		    SELECT COALESCE(SUM(o.totalAmount), 0)
		    FROM Orders o
		    WHERE o.status = 'DELIVERED'
		      AND MONTH(o.createdAt) = MONTH(CURRENT_DATE) - 1
		      AND YEAR(o.createdAt) = YEAR(CURRENT_DATE)
		    """)
		Double getPreviousMonthIncome();


	
}
