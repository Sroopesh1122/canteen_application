package com.sr.app.services;

public interface IPaymentService {
	
	public boolean verifyPayment(String razorpayOrderId, String razorpayPaymentId, String signature,String userId);

}
