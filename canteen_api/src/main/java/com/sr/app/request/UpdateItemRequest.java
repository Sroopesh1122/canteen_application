package com.sr.app.request;

import lombok.Data;

@Data
public class UpdateItemRequest {

	private String description;
	private boolean available;
	private String isAvailable;
	private Double price;
	
}
