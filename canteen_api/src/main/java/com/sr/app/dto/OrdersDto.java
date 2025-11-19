package com.sr.app.dto;

import java.time.LocalDateTime;
import java.util.List;

import com.sr.app.constants.OrderStatusConstants;
import com.sr.app.models.DeliveryAddress;

import lombok.Data;

@Data
public class OrdersDto {
	
	private String orderId;

    private String userId;

    private String razorpayOrderId;

    private String razorpayPaymentId;

    private String status = OrderStatusConstants.PENDING;

    private Double totalAmount;

    private DeliveryAddress deliveryAddress;
    
    private LocalDateTime createdAt;
    
    private LocalDateTime updatedAt;
    
    
    private List<OrderItem> items;
    
    
    @Data
    public static class OrderItem{
    	
    	private String orderItemId;

	    private String itemId;

	    private String itemName;

	    private Double price;

	    private Integer quantity;

	    private String imageUrl;
    	
    }

}
