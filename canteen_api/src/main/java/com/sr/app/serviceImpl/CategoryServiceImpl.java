package com.sr.app.serviceImpl;

import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.sr.app.dto.CategoryDto;
import com.sr.app.exception.AppException;
import com.sr.app.mapper.Mapper;
import com.sr.app.models.ItemCategory;
import com.sr.app.respos.CategoryRepo;
import com.sr.app.services.CloudinaryService;
import com.sr.app.services.ICategoryService;
import com.sr.app.utils.IdGeneration;


@Service
public class CategoryServiceImpl implements ICategoryService{

	@Autowired
	private CloudinaryService cloudinaryService;
	
	@Autowired
	private CategoryRepo categoryRepo;
	
	@Autowired
	private Mapper mapper;
	
	
	@Override
	public CategoryDto add(String categoryName, MultipartFile multipartFile) {
		
		  String slugName = categoryName.replaceAll(" ", "-").toLowerCase();

		    ItemCategory category = categoryRepo.findBySlugName(slugName);

		    if(category != null) {
		        throw new AppException("Category Already exists", HttpStatus.CONFLICT);
		    }

		    ItemCategory itemCategory = new ItemCategory();
		    itemCategory.setCategoryId(IdGeneration.generateRandomString());
		    itemCategory.setCategoryName(categoryName);
		    itemCategory.setSlugName(slugName);

		    Map<String, Object> uploadResponse = cloudinaryService.uploadImage(multipartFile);
		    itemCategory.setImgId(uploadResponse.get("public_id").toString());
		    itemCategory.setImgUrl(uploadResponse.get("secure_url").toString());

		    itemCategory = categoryRepo.save(itemCategory);

		    return mapper.toDto(itemCategory);
	}


	@Override
	public Page<CategoryDto> getAll(String q, Integer page, Integer limit) {
		
		Pageable pageable = PageRequest.of(page, limit);
		
		
		return categoryRepo.findAllByCategoryName(q, pageable).map(c->{
			return mapper.toDto(c);
		});
	}
	
	@Override
	public boolean delelte(String id) {
		
		try {
			categoryRepo.deleteById(id);
		} catch (Exception e) {
			// TODO: handle exception
			return false;
		}
		
		return true;
	}

}
