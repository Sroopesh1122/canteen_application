package com.sr.app.serviceImpl;

import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import com.razorpay.RazorpayException;
import com.razorpay.Utils;
import com.sr.app.exception.AppException;
import com.sr.app.respos.CartRepo;
import com.sr.app.services.IPaymentService;

@Service
public class PaymentServiceImpl implements IPaymentService {
	
	
	private final String  SECRET_KEY = "AVkua6VjB8TbbZiAc34vqQrQ";
	
	@Autowired
	private CartRepo cartRepo;

	@Override
	public boolean verifyPayment(String razorpayOrderId, String razorpayPaymentId, String signature,String userId) {
		JSONObject params = new JSONObject();
		params.put("razorpay_payment_id", razorpayPaymentId);
		params.put("razorpay_order_id", razorpayOrderId);
		params.put("razorpay_signature", signature);

		// Verify the payment signature
		boolean isValid = false;
		try {
			isValid = Utils.verifyPaymentSignature(params, SECRET_KEY);
		} catch (RazorpayException e) {
			e.printStackTrace();
			throw new AppException("Payment Failed", HttpStatus.BAD_REQUEST);
		}

		if (isValid) {
			cartRepo.deleteByUser(userId);
			return true;
		} else {
			return false;
		}
	}

}
