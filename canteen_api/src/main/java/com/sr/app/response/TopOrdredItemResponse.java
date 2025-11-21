package com.sr.app.response;

import lombok.Data;

@Data
public class TopOrdredItemResponse {

	private String itemId;

	private String itemName;

	private String description;

	private Double price;

	private String imgUrl;
	
    private String categoryId;
	
	private String categoryName;
	
	private Boolean isAvailable = true;
	
	private long totalCount;
	
}
