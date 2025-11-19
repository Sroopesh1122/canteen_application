package com.sr.app.respos;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.sr.app.models.ItemCategory;

public interface CategoryRepo extends JpaRepository<ItemCategory, String> {
	
	ItemCategory findBySlugName(String slugName);
	
	@Query("""
		    SELECT c 
		    FROM ItemCategory c
		    WHERE (:a IS NULL OR :a = '' OR LOWER(c.categoryName) LIKE LOWER(CONCAT(:a, '%')))
		""")
		Page<ItemCategory> findAllByCategoryName(@Param("a") String a, Pageable pageable);


}
