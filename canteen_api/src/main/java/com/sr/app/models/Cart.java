package com.sr.app.models;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.ManyToOne;
import lombok.Data;


@Data
@Entity
public class Cart {

	@Id
	private String cartId;

	@ManyToOne
	private Users user;
	
	@ManyToOne
	private MenuItems menuItem;
	
	
	private Integer quantity=1;
	
}
