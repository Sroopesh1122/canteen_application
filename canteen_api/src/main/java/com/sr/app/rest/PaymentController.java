package com.sr.app.rest;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.sr.app.constants.OrderStatusConstants;
import com.sr.app.models.Users;
import com.sr.app.request.PaymentVerificationRequest;
import com.sr.app.response.ApiResponse;
import com.sr.app.services.IOrderService;
import com.sr.app.services.IPaymentService;
import com.sr.app.services.UserDetailsImpl;

@RestController
@RequestMapping("/api/v1/payments")
public class PaymentController {
	
	@Autowired
	private IPaymentService paymentService;
	
	@Autowired
	private IOrderService orderService;
	
	@PostMapping("/secure/verify")
    public ResponseEntity<?> verifyPayment(@RequestBody PaymentVerificationRequest request,@AuthenticationPrincipal UserDetailsImpl userDetailsImpl)
    {
		Users user = userDetailsImpl.getUser();
		
		boolean isValid = paymentService.verifyPayment(request.getRazorpayOrderId(), request.getRazorpayPaymentId(), request.getRazorpaySignature(),user.getUserId());
		
		if(isValid)
		{
			orderService.updateStatus(request.getOrderId(), OrderStatusConstants.PAID);
		}else {
			orderService.updateStatus(request.getOrderId(), OrderStatusConstants.FAILED);
		}
		
		return ResponseEntity.ok(new ApiResponse<>("success","Payment veryfied", null));
    }
	

}
