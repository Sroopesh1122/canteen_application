package com.sr.app.models;

import java.time.LocalDateTime;

import com.fasterxml.jackson.annotation.JsonIgnore;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import lombok.Data;

@Data
@Entity
public class MenuItems {
	
	    @Id
	    private String itemId;

	    private String itemName;

	    private String description;

	    private Double price;
	    
	    private String imgUrl;
		
		@JsonIgnore
		private String imgId;

	    @ManyToOne
	    @JoinColumn(name = "category_id")
	    private ItemCategory category;

	    private Boolean isAvailable = true;
	    
	    private LocalDateTime createdAt = LocalDateTime.now();
	    
	    private LocalDateTime updatedAt;
	    

}
