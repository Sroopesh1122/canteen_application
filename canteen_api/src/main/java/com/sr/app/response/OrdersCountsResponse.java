package com.sr.app.response;

import lombok.Data;
@Data
public class OrdersCountsResponse {

	private Long totalOrders;
    private Long pending = 0L;
    private Long preparing = 0L;
    private Long delivered = 0L;
    private Long cancelled = 0L;
    private Long failed = 0L;
}

