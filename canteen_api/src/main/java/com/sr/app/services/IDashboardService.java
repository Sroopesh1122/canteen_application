package com.sr.app.services;

import java.util.List;

import com.sr.app.request.IncomeDto;
import com.sr.app.response.AdminDashboardResponse;
import com.sr.app.response.TopOrdredItemResponse;

public interface IDashboardService {
	
	
	public AdminDashboardResponse dashboardResponse();
	public List<IncomeDto> incomeByMonths(int months);
	
	public List<TopOrdredItemResponse> topOrderedItem();

}
