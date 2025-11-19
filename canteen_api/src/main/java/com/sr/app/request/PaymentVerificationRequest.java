package com.sr.app.request;

import lombok.Data;

@Data
public class PaymentVerificationRequest {

	private String razorpayOrderId;
	
	private String razorpayPaymentId;
	
	private String razorpaySignature;
	
	private String orderId;
	
}
