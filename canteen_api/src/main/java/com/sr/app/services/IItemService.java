package com.sr.app.services;

import java.util.List;

import org.springframework.web.multipart.MultipartFile;

import com.sr.app.dto.MenuItemCartInfoDto;
import com.sr.app.dto.MenuItemDto;
import com.sr.app.response.PageResponse;

public interface IItemService {
	
	
	public MenuItemDto add(String itemName,String description,Double price,String categoryId,MultipartFile img);
	
	public MenuItemDto update(String itemId,String description,Double price,boolean available);
	
	public PageResponse<MenuItemDto> findAll(String q, String category, Double minPrice, Double maxPrice,Integer page,Integer limit);
	
	public PageResponse<MenuItemCartInfoDto> findAll(String userId,String q, String category, Double minPrice, Double maxPrice,Integer page,Integer limit);
	
	public boolean delete(String itemId);
	
	public MenuItemDto getById(String itemId);
	
	public MenuItemCartInfoDto getById(String itemId,String userId);
	
	public List<MenuItemDto> getItemByCategory(String categoryId);

	
}
