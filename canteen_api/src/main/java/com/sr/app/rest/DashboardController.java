package com.sr.app.rest;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.sr.app.response.ApiResponse;
import com.sr.app.services.IDashboardService;

@RestController
@RequestMapping("/api/v1/dashboard")
public class DashboardController {
	
	
	@Autowired
	private IDashboardService dashboardService;
	
	@GetMapping("/public/stats1")
	public ResponseEntity<?> getStats1()
	{
		return ResponseEntity.ok(new ApiResponse<>("success","Dashboard Stats", dashboardService.dashboardResponse()));
	}

}
