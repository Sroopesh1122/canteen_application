package com.sr.app.mapper;

import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import com.sr.app.dto.CartDto;
import com.sr.app.dto.CategoryDto;
import com.sr.app.dto.MenuItemCartInfoDto;
import com.sr.app.dto.MenuItemDto;
import com.sr.app.dto.OrdersDto;
import com.sr.app.dto.UserDto;
import com.sr.app.models.Cart;
import com.sr.app.models.ItemCategory;
import com.sr.app.models.MenuItems;
import com.sr.app.models.Orders;
import com.sr.app.models.Users;

@Component
public class Mapper {

	
	@Autowired
	private ModelMapper modelMapper;
	
	
	public CategoryDto toDto(ItemCategory itemCategory)
	{
		return modelMapper.map(itemCategory, CategoryDto.class);
	}
	
	public MenuItemDto toDto(MenuItems menuItem)
	{
		MenuItemDto menuItemDto = new MenuItemDto();
		
		menuItemDto.setCategoryId(menuItem.getCategory().getCategoryId());
		menuItemDto.setCategoryName(menuItem.getCategory().getCategoryName());
		menuItemDto.setDescription(menuItem.getDescription());
		menuItemDto.setImgUrl(menuItem.getImgUrl());
		menuItemDto.setIsAvailable(menuItem.getIsAvailable());
		menuItemDto.setItemId(menuItem.getItemId());
		menuItemDto.setItemName(menuItem.getItemName());
		menuItemDto.setPrice(menuItem.getPrice());
		menuItemDto.setCreatedAt(menuItem.getCreatedAt());
		menuItemDto.setUpdatedAt(menuItem.getUpdatedAt());
		
		return menuItemDto;
	}
	
	public MenuItemCartInfoDto toDto(MenuItems menuItem,boolean isSaved)
	{
		MenuItemCartInfoDto menuItemDto = new MenuItemCartInfoDto();
		
		menuItemDto.setCategoryId(menuItem.getCategory().getCategoryId());
		menuItemDto.setCategoryName(menuItem.getCategory().getCategoryName());
		menuItemDto.setDescription(menuItem.getDescription());
		menuItemDto.setImgUrl(menuItem.getImgUrl());
		menuItemDto.setIsAvailable(menuItem.getIsAvailable());
		menuItemDto.setItemId(menuItem.getItemId());
		menuItemDto.setItemName(menuItem.getItemName());
		menuItemDto.setPrice(menuItem.getPrice());
		menuItemDto.setCreatedAt(menuItem.getCreatedAt());
		menuItemDto.setUpdatedAt(menuItem.getUpdatedAt());
		menuItemDto.setSaved(isSaved);
		
		return menuItemDto;
	}
	
	public UserDto toDto(Users users)
	{
		return modelMapper.map(users, UserDto.class);
	}
	
	public CartDto toDto(Cart cart)
	{
		CartDto cartDto = new CartDto();
		cartDto.setCartId(cart.getCartId());
		cartDto.setQuantity(cart.getQuantity());
		cartDto.setMenuItem(toDto(cart.getMenuItem()));
		cartDto.setUsers(toDto(cart.getUser()));
	    return cartDto;	
	}
	
	
	public OrdersDto toDto(Orders order)
	{
		return modelMapper.map(order, OrdersDto.class);
	}
	
}
