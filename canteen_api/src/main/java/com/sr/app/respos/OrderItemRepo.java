package com.sr.app.respos;

import java.util.List;

import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import com.sr.app.models.OrderItem;

public interface OrderItemRepo extends JpaRepository<OrderItem, String> {

	@Query("SELECT oi.itemId AS itemId, SUM(oi.quantity) AS totalQuantity " +
		       "FROM OrderItem oi " +
		       "JOIN oi.order o " +
		       "WHERE o.status <> 'CANCELLED' " +
		       "GROUP BY oi.itemId, oi.itemName " +
		       "ORDER BY totalQuantity DESC")
		List<Object[]> getTopOrderedItems(Pageable pageable);


	
}
