package com.sr.app.respos;

import org.springframework.data.jpa.repository.JpaRepository;

import com.sr.app.models.OrderItem;

public interface OrderItemRepo extends JpaRepository<OrderItem, String> {

}
