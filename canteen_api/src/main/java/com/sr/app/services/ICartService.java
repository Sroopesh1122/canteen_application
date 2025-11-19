package com.sr.app.services;

import java.util.List;

import com.sr.app.dto.CartDto;

public interface ICartService {
	
	public void addItem(String itemId,String userId);
	public void deleteItem(String cartId);
	public List<CartDto> items(String userId);
	public void updateCartitemQuantity(String cartId,Integer quantity);
	

}
