package com.sr.app.services;

import com.sr.app.dto.OrderUserDto;
import com.sr.app.dto.OrdersDto;
import com.sr.app.request.OrderRequest;
import com.sr.app.response.OrderResponse;
import com.sr.app.response.OrdersCountsResponse;
import com.sr.app.response.PageResponse;

public interface IOrderService {
	
	
	public OrderResponse create(OrderRequest orderRequest,String userId);
	
	public void updateStatus(String orderId,String status);
	
	public PageResponse<OrdersDto> getOrders(String userId,Integer page,Integer limit);
	
	public PageResponse<OrderUserDto> getOrders(Integer page,Integer limit,String status);
	
	public OrdersDto getOrder(String orderId);
	
	public OrdersCountsResponse getOrderStats();
	


}
