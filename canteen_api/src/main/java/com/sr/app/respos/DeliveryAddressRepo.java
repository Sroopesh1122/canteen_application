package com.sr.app.respos;

import org.springframework.data.jpa.repository.JpaRepository;

import com.sr.app.models.DeliveryAddress;

public interface DeliveryAddressRepo extends JpaRepository<DeliveryAddress, String>{

}
