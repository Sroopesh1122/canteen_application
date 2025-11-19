package com.sr.app.dto;

import java.time.LocalDateTime;

import lombok.Data;

@Data
public class MenuItemCartInfoDto {

	private String itemId;

	private String itemName;

	private String description;

	private Double price;

	private String imgUrl;
	
    private String categoryId;
	
	private String categoryName;
	
	private Boolean isAvailable = true;
	
	 private LocalDateTime createdAt;
	    
	private LocalDateTime updatedAt;
	
	private boolean isSaved =false;
	
}
