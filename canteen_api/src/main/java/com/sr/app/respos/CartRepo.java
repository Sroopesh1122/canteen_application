package com.sr.app.respos;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.transaction.annotation.Transactional;

import com.sr.app.models.Cart;

public interface CartRepo extends JpaRepository<Cart, String> {
	
	@Query("SELECT c From Cart c WHERE c.user.userId =:userId AND c.menuItem.itemId = :itemId")
	public Cart findByUserAndItem(String userId,String itemId);
	
	@Query("SELECT c From Cart c WHERE c.user.userId =:userId")
	public List<Cart> findByUser(String userId);
	
	
	@Transactional
	@Modifying
	@Query("DELETE FROM Cart c WHERE c.user.userId = :userId")
	public void deleteByUser(String userId);

}
