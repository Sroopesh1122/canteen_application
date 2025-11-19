package com.sr.app.respos;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.sr.app.models.MenuItems;


public interface MenuItemRespo extends JpaRepository<MenuItems, String> {
	
	MenuItems findByItemNameIgnoreCase(String itemName);
	
	@Query("""
		    SELECT m
		    FROM MenuItems m
		    WHERE (:q IS NULL 
		        OR :q = '' 
		        OR LOWER(m.itemName) LIKE LOWER(CONCAT(:q, '%')))
		      AND (:category IS NULL 
		        OR :category = '' 
		        OR m.category.categoryId = :category)
		      AND (:minPrice IS NULL 
		        OR m.price >= :minPrice)
		      AND (:maxPrice IS NULL 
		        OR m.price <= :maxPrice)
		""")
		Page<MenuItems> findAll(
		        @Param("q") String q,
		        @Param("category") String category,
		        @Param("minPrice") Double minPrice,
		        @Param("maxPrice") Double maxPrice,
		        Pageable pageable
		);
	
	@Query("""
			SELECT m FROM MenuItems m
			WHERE (:category  IS NULL OR m.category.categoryId = :category )
		   """)
	List<MenuItems> findByCategory(String category);




}
