package com.sr.app.services;

import org.springframework.data.domain.Page;

import com.sr.app.dto.OrdersDto;
import com.sr.app.request.OrderRequest;
import com.sr.app.response.OrderResponse;

public interface IOrderService {
	
	
	public OrderResponse create(OrderRequest orderRequest,String userId);
	
	public void updateStatus(String orderId,String status);
	
	public Page<OrdersDto> getOrders(String userId,Integer page,Integer limit);
	
	public OrdersDto getOrder(String orderId);

}
