package com.sr.app.models;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import lombok.Data;

@Data
@Entity
public class DeliveryAddress {
	
	@Id
	private String id;
	
	@Column(name = "delivery_name", nullable = false)
    private String name;

    @Column(name = "delivery_phone", nullable = false)
    private String phone;

    @Column(name = "delivery_address", nullable = false)
    private String address;

    @Column(name = "delivery_city", nullable = false)
    private String city;

    @Column(name = "delivery_pincode", nullable = false)
    private String pincode;

}
