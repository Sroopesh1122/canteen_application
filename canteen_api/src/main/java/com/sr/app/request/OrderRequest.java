package com.sr.app.request;

import java.util.List;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class OrderRequest {
    private List<OrderItemRequest> items;
    private DeliveryAddressRequest deliveryAddress;
    private Double totalAmount;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class OrderItemRequest {
        private String itemId;
        private Integer quantity;
        private Double price;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class DeliveryAddressRequest {
        private String name;
        private String phone;
        private String address;
        private String city;
        private String pincode;
    }
}
