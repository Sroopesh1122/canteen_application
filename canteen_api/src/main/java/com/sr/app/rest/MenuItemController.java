package com.sr.app.rest;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.sr.app.dto.MenuItemDto;
import com.sr.app.request.UpdateItemRequest;
import com.sr.app.response.ApiResponse;
import com.sr.app.services.IItemService;

@RestController
@RequestMapping("/api/v1/menu-item")
public class MenuItemController {

	
	@Autowired
	private IItemService itemService;
	
	
	@PostMapping("/secure/add")
	@PreAuthorize("hasRole('ADMIN')")
	public ResponseEntity<?> addMenuItem(
			@RequestParam String itemName,
			@RequestParam String description,
			@RequestParam Double price,
			@RequestParam String categoryId,
			@RequestPart MultipartFile img
			)
	{
		MenuItemDto menuItemDto = itemService.add(itemName, description, price, categoryId, img);
		
		return ResponseEntity.ok(new ApiResponse<>("success","New Item added to menu", menuItemDto));
	}
	
	
	@GetMapping("/public/")
	public ResponseEntity<?> getItem(
			@RequestParam(required = false) String q, 
			@RequestParam(required = false) String category,
			@RequestParam(required = false) Double minPrice,
	        @RequestParam(required = false) Double maxPrice,
			@RequestParam(defaultValue = "0",required = false) Integer page,
			@RequestParam(defaultValue = "10",required = false) Integer limit)
	{
		return ResponseEntity.ok(new ApiResponse<>("success", "Menu Item", itemService.findAll(q,category,minPrice,maxPrice, page, limit)));
	}
	
	
	// is user saved in cart or not
	@GetMapping("/public/user/")
	public ResponseEntity<?> getItemForUser(
			@RequestParam(required = false) String userId, 
			@RequestParam(required = false) String q, 
			@RequestParam(required = false) String category,
			@RequestParam(required = false) Double minPrice,
	        @RequestParam(required = false) Double maxPrice,
			@RequestParam(defaultValue = "0",required = false) Integer page,
			@RequestParam(defaultValue = "10",required = false) Integer limit)
	{
		return ResponseEntity.ok(new ApiResponse<>("success", "Menu Item", itemService.findAll(userId,q,category,minPrice,maxPrice, page, limit)));
	}
	
	@PutMapping("/secure/{id}")
	public ResponseEntity<?> updateItem(@PathVariable String id, @RequestBody UpdateItemRequest request)
	{
		MenuItemDto menuItemDto = itemService.update(id, request.getDescription(), request.getPrice(), request.getIsAvailable().equalsIgnoreCase("true")?true :false);
		return ResponseEntity.ok(new ApiResponse<>("success","Menu Item updated successfully", menuItemDto));
	}
	
	
	@DeleteMapping("/secure/{id}")
	public ResponseEntity<?> deleteMenuItem(@PathVariable String id)
	{
		itemService.delete(id);
		return ResponseEntity.ok(new ApiResponse<>("success","Menu Item deleted successfully", null));
	}
	
	@GetMapping("/public/user/{id}")
	public ResponseEntity<?> getItemWithCartInfo(@PathVariable String id,@RequestParam String userId)
	{
		return ResponseEntity.ok(new ApiResponse<>("success","Menu Item", itemService.getById(id,userId)));
	}
	
	
	@GetMapping("/public/{id}")
	public ResponseEntity<?> getItem(@PathVariable String id)
	{
		return ResponseEntity.ok(new ApiResponse<>("success","Menu Item", itemService.getById(id)));
	}
	
	@GetMapping("/public/category/{id}")
	public ResponseEntity<?> getItemByCategory(@PathVariable String id)
	{
		return ResponseEntity.ok(new ApiResponse<>("success","Menu Item", itemService.getItemByCategory(id)));
	}
	
}
