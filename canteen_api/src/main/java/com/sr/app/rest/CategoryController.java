package com.sr.app.rest;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.sr.app.dto.CategoryDto;
import com.sr.app.response.ApiResponse;
import com.sr.app.response.PageResponse;
import com.sr.app.services.ICategoryService;

@RequestMapping("/api/v1/category")
@RestController
public class CategoryController {
	
	
	@Autowired
	private ICategoryService categoryService;
	
	@PostMapping("/secure/add")
	@PreAuthorize("hasRole('ADMIN')")
	public ResponseEntity<?> addCategory(
			@RequestParam String categoryName,
			@RequestPart MultipartFile img)
	{
		categoryService.add(categoryName, img);
		
		return ResponseEntity.ok(new ApiResponse<>("success", "New Category Added", null));
		
	}
	
	
	@GetMapping("/public/")
	public ResponseEntity<?> getCategory(
			@RequestParam(required = false) String q,
			@RequestParam(required = false,defaultValue = "0") Integer page,
			@RequestParam(required = false,defaultValue = "10") Integer limit)
	{
		PageResponse<CategoryDto> categories = categoryService.getAll(q, page, limit);
		
		return ResponseEntity.ok(new ApiResponse<>("success", "Categories", categories));
		
	}
	
	@DeleteMapping("/secure/{id}")
	@PreAuthorize("hasRole('ADMIN')")
	public ResponseEntity<?> deleteCategory(@PathVariable String id)
	{
		categoryService.delelte(id);
		return ResponseEntity.ok(new ApiResponse<>("success","Category Deleted Successfully", null));
	}
	

}
