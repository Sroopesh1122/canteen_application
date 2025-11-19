package com.sr.app.response;

import lombok.Data;

@Data
public class AdminDashboardResponse {

	private Long users;
	private Long menuItems;
	private Long categories;
	private Long orders;
	private Double currentMonthIncome;
	private Double previousMonthIncome;
	
	
}
