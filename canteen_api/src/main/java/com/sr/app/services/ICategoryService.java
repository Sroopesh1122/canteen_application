package com.sr.app.services;

import org.springframework.data.domain.Page;
import org.springframework.web.multipart.MultipartFile;

import com.sr.app.dto.CategoryDto;

public interface ICategoryService {
	
	public CategoryDto add(String categoryName,MultipartFile multipartFile);
	
	public Page<CategoryDto> getAll(String q ,Integer page,Integer limit);
	
	public boolean delelte(String id);
	

}
