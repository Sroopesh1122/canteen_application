package com.sr.app.serviceImpl;

import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.sr.app.dto.MenuItemCartInfoDto;
import com.sr.app.dto.MenuItemDto;
import com.sr.app.exception.AppException;
import com.sr.app.mapper.Mapper;
import com.sr.app.models.ItemCategory;
import com.sr.app.models.MenuItems;
import com.sr.app.respos.CartRepo;
import com.sr.app.respos.CategoryRepo;
import com.sr.app.respos.MenuItemRespo;
import com.sr.app.services.CloudinaryService;
import com.sr.app.services.IItemService;
import com.sr.app.utils.IdGeneration;

@Service
public class ItemServiceImpl implements IItemService {

	@Autowired
	private MenuItemRespo itemRespo;

	@Autowired
	private CloudinaryService cloudinaryService;

	@Autowired
	private CategoryRepo categoryRepo;

	@Autowired
	private Mapper mapper;

	@Autowired
	private CartRepo cartRepo;

	@Override
	public MenuItemDto add(String itemName, String description, Double price, String categoryId, MultipartFile img) {

		MenuItems findItem = itemRespo.findByItemNameIgnoreCase(itemName);

		if (findItem != null) {
			throw new AppException("Item" + itemName + " Already exists", HttpStatus.CONFLICT);
		}

		ItemCategory itemCategory = categoryRepo.findById(categoryId).orElse(null);

		if (itemCategory == null) {
			throw new AppException("Category Not Found", HttpStatus.NOT_FOUND);
		}

		MenuItems newItem = new MenuItems();
		newItem.setCategory(itemCategory);
		newItem.setDescription(description);
		newItem.setIsAvailable(true);
		newItem.setItemId(IdGeneration.generateRandomString());
		newItem.setItemName(itemName);
		newItem.setPrice(price);

		Map<String, Object> uploadResponse = cloudinaryService.uploadImage(img);
		newItem.setImgId(uploadResponse.get("public_id").toString());
		newItem.setImgUrl(uploadResponse.get("secure_url").toString());

		newItem = itemRespo.save(newItem);

		return mapper.toDto(newItem);
	}

	@Override
	public MenuItemDto update(String itemId, String description, Double price, boolean available) {
		MenuItems findItem = itemRespo.findById(itemId).orElse(null);

		if (findItem == null) {
			throw new AppException("Item not found", HttpStatus.NOT_FOUND);
		}
		findItem.setDescription(description);
		findItem.setPrice(price);
		findItem.setIsAvailable(available);

		return mapper.toDto(itemRespo.save(findItem));
	}

	@Override
	public Page<MenuItemCartInfoDto> findAll(String userId, String q, String category, Double minPrice, Double maxPrice,
			Integer page, Integer limit) {

		Pageable pageable = PageRequest.of(page, limit);

		return itemRespo.findAll(q, category, minPrice, maxPrice, pageable).map(i -> {

			MenuItemCartInfoDto menuItemCartInfoDto = mapper.toDto(i,
					userId != null ? cartRepo.findByUserAndItem(userId, i.getItemId()) != null ? true : false : false);

			return menuItemCartInfoDto;

		});
	}

	@Override
	public Page<MenuItemDto> findAll(String q, String category, Double minPrice, Double maxPrice, Integer page,
			Integer limit) {

		Pageable pageable = PageRequest.of(page, limit);

		return itemRespo.findAll(q, category, minPrice, maxPrice, pageable).map(i -> {
			return mapper.toDto(i);
		});
	}

	@Override
	public boolean delete(String itemId) {

		try {
			itemRespo.deleteById(itemId);
		} catch (Exception e) {
			// TODO: handle exception
			return false;
		}

		return true;
	}
	
	@Override
	public MenuItemCartInfoDto getById(String itemId, String userId) {
		MenuItems menuItems = itemRespo.findById(itemId).orElse(null);
		if (menuItems == null) {
			throw new AppException("Item Not Found", HttpStatus.NOT_FOUND);
		}
		
		MenuItemCartInfoDto menuItemCartInfoDto = mapper.toDto(menuItems,
				userId != null ? cartRepo.findByUserAndItem(userId, menuItems.getItemId()) != null ? true : false : false);

		return menuItemCartInfoDto;
	}

	@Override
	public MenuItemDto getById(String itemId) {

		MenuItems menuItems = itemRespo.findById(itemId).orElse(null);
		if (menuItems == null) {
			throw new AppException("Item Not Found", HttpStatus.NOT_FOUND);
		}

		return mapper.toDto(menuItems);
	}

	@Override
	public List<MenuItemDto> getItemByCategory(String categoryId) {

		return itemRespo.findByCategory(categoryId).stream().map(i -> {
			return mapper.toDto(i);
		}).toList();

	}

}
