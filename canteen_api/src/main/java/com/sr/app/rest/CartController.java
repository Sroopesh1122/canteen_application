package com.sr.app.rest;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.sr.app.models.Users;
import com.sr.app.response.ApiResponse;
import com.sr.app.services.ICartService;
import com.sr.app.services.UserDetailsImpl;

@RestController
@RequestMapping("/api/v1/cart")
public class CartController {
	
	@Autowired
	private ICartService cartService;
	
	@PostMapping("/secure/add")
	public ResponseEntity<?> addTocart(@RequestParam String userId,@RequestParam String itemId)
	{
		cartService.addItem(itemId, userId);
		return ResponseEntity.ok(new ApiResponse<>("success","Added to cart", null));
	}
	
	@PutMapping("/secure/{id}/quantity")
	public ResponseEntity<?> updateQuantity(@PathVariable String id , @RequestParam Integer quantity)
	{
		cartService.updateCartitemQuantity(id, quantity);
		return ResponseEntity.ok(new ApiResponse<>("success","Cart Quantity updated", null));
	}
	
	@DeleteMapping("/secure/remove")
	public ResponseEntity<?> deltemFromCart(@RequestParam String cartId)
	{
		cartService.deleteItem(cartId);
		return ResponseEntity.ok(new ApiResponse<>("success","Delete from cart", null));
	}
	
	@GetMapping("/secure/")
	public ResponseEntity<?> getCartItems(@AuthenticationPrincipal UserDetailsImpl userDetailsImpl)
	{
		Users user = userDetailsImpl.getUser();		
		return ResponseEntity.ok(new ApiResponse<>("success","Cart Data", cartService.items(user.getUserId())));
	}
	

}
