package com.sr.app.serviceImpl;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import com.sr.app.constants.OrderStatusConstants;
import com.sr.app.models.MenuItems;
import com.sr.app.request.IncomeDto;
import com.sr.app.response.AdminDashboardResponse;
import com.sr.app.response.TopOrdredItemResponse;
import com.sr.app.respos.CartRepo;
import com.sr.app.respos.MenuItemRespo;
import com.sr.app.respos.OrderItemRepo;
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
	
	@Autowired
	private MenuItemRespo itemRespo;
	
	@Autowired
	private OrderItemRepo orderItemRepo;

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
	

	@Override
	public List<IncomeDto> incomeByMonths(int months) {
		LocalDate now = LocalDate.now().withDayOfMonth(1); // current month (1st date)
        LocalDate end = now.plusMonths(1);                 // next month
        LocalDate start = now.minusMonths(months - 1);     // n months back

        // Query DB
        List<Object[]> data = orderRepo.getMonthlyIncome(
                start.atStartOfDay(),
                end.atStartOfDay()
        );

        // Convert DB rows to map: month -> income
        Map<String, Double> incomeMap = new HashMap<>();
        for (Object[] row : data) {
            String month = (String) row[0];
            Double income = ((Number) row[1]).doubleValue();
            incomeMap.put(month, income);
        }

        // Format YYYY-MM
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM");

        // Final result list
        List<IncomeDto> result = new ArrayList<>();

        // Loop through each month
        LocalDate pointer = start;
        while (!pointer.isAfter(now)) {
            String monthStr = pointer.format(formatter);
            Double income = incomeMap.getOrDefault(monthStr, 0.0);

            result.add(new IncomeDto(monthStr, income));

            pointer = pointer.plusMonths(1);
        }

        // Sort (latest month first)
        result.sort((a, b) -> b.getMonth().compareTo(a.getMonth()));

        return result;
	}
	
	@Override
	public List<TopOrdredItemResponse> topOrderedItem() {
		// TODO Auto-generated method stub
		
		List<TopOrdredItemResponse> response = new ArrayList<>();
		
		Pageable topFive = PageRequest.of(0, 5);
		
		List<Object[]> data = orderItemRepo.getTopOrderedItems(topFive);
		
		for (Object[] row : data) {
            String itemId = (String) row[0];
            long count = (long) row[1];
            
            if(itemId!=null)
            {
            	MenuItems menuItem = menuItemRespo.findById(itemId).orElse(null);
            	if(menuItem!=null)
            	{
            		TopOrdredItemResponse orderData = new TopOrdredItemResponse();
            		orderData.setCategoryId(menuItem.getCategory().getCategoryId());
            		orderData.setCategoryName(menuItem.getCategory().getCategoryName());
            		orderData.setDescription(menuItem.getDescription());
            		orderData.setImgUrl(menuItem.getImgUrl());
            		orderData.setIsAvailable(menuItem.getIsAvailable());
            		orderData.setItemId(itemId);
            		orderData.setItemName(menuItem.getItemName());
            		orderData.setPrice(menuItem.getPrice());
            		orderData.setTotalCount(count);
            		response.add(orderData);
            	}
            }
            
        }
		
		return response;
	}

}
