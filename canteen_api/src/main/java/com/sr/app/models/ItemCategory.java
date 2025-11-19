package com.sr.app.models;

import java.time.LocalDateTime;
import com.fasterxml.jackson.annotation.JsonIgnore;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import lombok.Data;


@Data
@Entity
public class ItemCategory {

	
	@Id
	private String categoryId;
	
	private String categoryName;
	
	private String slugName;
	
	private String imgUrl;
	
	@JsonIgnore
	private String imgId;
	
	private LocalDateTime createdAt = LocalDateTime.now();
	
	private LocalDateTime updatedAt ;
	
	
}
