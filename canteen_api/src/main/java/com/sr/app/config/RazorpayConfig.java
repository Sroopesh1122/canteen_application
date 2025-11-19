package com.sr.app.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import com.razorpay.RazorpayClient;
import com.razorpay.RazorpayException;

//RazorpayConfig.java
@Configuration
public class RazorpayConfig {

 @Value("${razorpay.key.id}")
 private String razorpayKeyId;

 @Value("${razorpay.key.secret}")
 private String razorpaySecret;

 @Bean
 public RazorpayClient razorpayClient() {
     try {
		return new RazorpayClient(razorpayKeyId, razorpaySecret);
	} catch (RazorpayException e) {
		// TODO Auto-generated catch block
		e.printStackTrace();
		return null;
	}
 }
}



