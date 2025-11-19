package com.sr.app.rest;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.sr.app.constants.OrderStatusConstants;
import com.sr.app.models.Users;
import com.sr.app.request.OrderRequest;
import com.sr.app.response.ApiResponse;
import com.sr.app.response.OrderResponse;
import com.sr.app.services.IOrderService;
import com.sr.app.services.UserDetailsImpl;

import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestParam;


@RestController
@RequestMapping("/api/v1/orders")
public class OrderController {
	
	
	@Autowired
	private IOrderService orderService;
	
	
	@PostMapping("/secure/create")
	public ResponseEntity<?> createOrder(
			@AuthenticationPrincipal UserDetailsImpl userDetailsImpl,
			@RequestBody OrderRequest orderRequest)
	{
		Users user = userDetailsImpl.getUser();
		
		OrderResponse orderResponse = orderService.create(orderRequest, user.getUserId());
		
		return ResponseEntity.ok(new ApiResponse<>("success","New Order Created", orderResponse));
		
		
	}
	
	@GetMapping("/secure/all")
	public ResponseEntity<?> getOrders(
			@AuthenticationPrincipal UserDetailsImpl userDetailsImpl,
			@RequestParam(required = false ,defaultValue = "0") Integer page,
			@RequestParam(required = false ,defaultValue = "10") Integer limit) {
		
		return ResponseEntity.ok(new ApiResponse<>("success","Orders", orderService.getOrders(userDetailsImpl.getUser().getUserId(), page, limit)));
		
	}
	
	@GetMapping("/secure/{id}")
	public ResponseEntity<?> getOrder(@PathVariable String id)
	{
		return ResponseEntity.ok(new ApiResponse<>("success","Order data", orderService.getOrder(id)));
	}
	
	@DeleteMapping("/secure/{id}/cancel")
	public ResponseEntity<?> cancelOrder(@PathVariable String id)
	{
		orderService.updateStatus(id, OrderStatusConstants.CANCELLED);
		return ResponseEntity.ok(new ApiResponse<>("success","Order canceled", null));
	}
	

}
