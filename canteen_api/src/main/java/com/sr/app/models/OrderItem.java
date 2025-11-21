package com.sr.app.models;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import lombok.Data;

@Data
@Entity
public class OrderItem {
	
	    @Id
	    private String orderItemId;

	    @Column(name = "item_id", nullable = false)
	    private String itemId;

	    @Column(name = "item_name", nullable = false)
	    private String itemName;

	    @Column(name = "item_price", nullable = false)
	    private Double price;

	    @Column(name = "quantity", nullable = false)
	    private Integer quantity;

	    @Column(name = "item_image_url")
	    private String imageUrl;
	    
	    @ManyToOne
	    @JoinColumn(name = "order_id")
	    private Orders order;
	
}
