package com.sr.app.serviceImpl;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.sr.app.constants.OrderStatusConstants;
import com.sr.app.response.AdminDashboardResponse;
import com.sr.app.respos.CartRepo;
import com.sr.app.respos.MenuItemRespo;
import com.sr.app.respos.OrderRepo;
import com.sr.app.respos.UserRepo;
import com.sr.app.services.IDashboardService;

@Service
public class DashboardServiceImpl implements IDashboardService {
	
	
	@Autowired
	private CartRepo cartRepo;
	
	@Autowired
	private MenuItemRespo menuItemRespo;
	
	@Autowired
	private UserRepo userRepo;
	
	@Autowired
	private OrderRepo orderRepo;

	@Override
	public AdminDashboardResponse dashboardResponse() {
		
		AdminDashboardResponse adminDashboardResponse = new AdminDashboardResponse();
		adminDashboardResponse.setCategories(cartRepo.count());
		adminDashboardResponse.setCurrentMonthIncome(orderRepo.getCurrentMonthIncome());
		adminDashboardResponse.setMenuItems(menuItemRespo.count());
		adminDashboardResponse.setOrders(orderRepo.countOrderByStatus(OrderStatusConstants.DELIVERED));
		adminDashboardResponse.setPreviousMonthIncome(orderRepo.getPreviousMonthIncome());
		adminDashboardResponse.setUsers(userRepo.count()-1);
		
		
		return adminDashboardResponse;
	}

}
