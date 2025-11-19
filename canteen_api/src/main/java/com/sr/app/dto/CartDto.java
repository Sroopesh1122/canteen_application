package com.sr.app.dto;

import lombok.Data;

@Data
public class CartDto {

	
	private String cartId;
	
	private Integer quantity;
	
	private UserDto users;
	
	private MenuItemDto menuItem;
}
