package com.sr.app.dto;

import java.time.LocalDateTime;

import lombok.Data;

@Data
public class CategoryDto {
	
    private String categoryId;
	
	private String categoryName;
	
	private String slugName;
	
	private String imgUrl;
	
    private LocalDateTime createdAt;
	
	private LocalDateTime updatedAt ;

}
