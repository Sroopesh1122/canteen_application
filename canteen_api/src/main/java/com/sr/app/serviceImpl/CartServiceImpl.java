package com.sr.app.serviceImpl;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import com.sr.app.dto.CartDto;
import com.sr.app.exception.AppException;
import com.sr.app.mapper.Mapper;
import com.sr.app.models.Cart;
import com.sr.app.models.MenuItems;
import com.sr.app.models.Users;
import com.sr.app.respos.CartRepo;
import com.sr.app.respos.MenuItemRespo;
import com.sr.app.respos.UserRepo;
import com.sr.app.services.ICartService;
import com.sr.app.utils.IdGeneration;


@Service
public class CartServiceImpl implements ICartService {

	@Autowired
	private CartRepo cartRepo;
	
	@Autowired
	private MenuItemRespo itemRespo;
	
	@Autowired
	private UserRepo userRepo;
	
	@Autowired
	private Mapper mapper;
	
	@Override
	public void addItem(String itemId, String userId) {
		// TODO Auto-generated method stub
		
		MenuItems item = itemRespo.findById(itemId).orElse(null);
		Users user = userRepo.findById(userId).orElse(null);
		
		Cart findItem = cartRepo.findByUserAndItem(userId, itemId);
		
		if(findItem != null)
		{
			throw new AppException("Already added to cart", HttpStatus.BAD_REQUEST);
		}
		
		if(user !=null && item!=null)
		{
			Cart cart = new Cart();
			cart.setCartId(IdGeneration.generateRandomString());
			cart.setMenuItem(item);
			cart.setUser(user);
			cartRepo.save(cart);
		}
		

	}

	@Override
	public void deleteItem(String cartId) {
		
		cartRepo.deleteById(cartId);
		
	}

	@Override
	public List<CartDto> items(String userId) {
		return cartRepo.findByUser(userId).stream().map(c->mapper.toDto(c)).toList();
	}

	@Override
	public void updateCartitemQuantity(String cartId,Integer quantity) {
		// TODO Auto-generated method stub
		
		Cart cart= cartRepo.findById(cartId).orElse(null);
		if(cart !=null)
		{
			if(!cart.getMenuItem().getIsAvailable())
			{
				throw new AppException("Item not available", HttpStatus.BAD_REQUEST);
			}
			
			cart.setQuantity(quantity);
			cartRepo.save(cart);
		}
		
		
	}

}
