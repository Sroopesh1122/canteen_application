package com.sr.app.dto;

import java.time.LocalDateTime;
import java.util.List;

import com.sr.app.constants.OrderStatusConstants;
import com.sr.app.dto.OrdersDto.OrderItem;
import com.sr.app.models.DeliveryAddress;

import lombok.Data;

@Data
public class OrderUserDto {

	private OrdersDto order;
    
    
    private UserDto user;
	
}
