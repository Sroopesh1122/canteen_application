package com.sr.app.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.RequiredArgsConstructor;

@Data
@RequiredArgsConstructor
@AllArgsConstructor
public class OrderResponse {

   private String razorpayOrderId;
   
   private String orderId;
	
}
