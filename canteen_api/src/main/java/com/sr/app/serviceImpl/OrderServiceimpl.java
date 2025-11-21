package com.sr.app.serviceImpl;


import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

import org.json.JSONObject;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import com.razorpay.Order;
import com.razorpay.RazorpayClient;
import com.razorpay.RazorpayException;
import com.sr.app.constants.OrderStatusConstants;
import com.sr.app.dto.OrderUserDto;
import com.sr.app.dto.OrdersDto;
import com.sr.app.exception.AppException;
import com.sr.app.mapper.Mapper;
import com.sr.app.models.DeliveryAddress;
import com.sr.app.models.MenuItems;
import com.sr.app.models.OrderItem;
import com.sr.app.models.Orders;
import com.sr.app.request.OrderRequest;
import com.sr.app.request.OrderRequest.OrderItemRequest;
import com.sr.app.response.OrderResponse;
import com.sr.app.response.OrdersCountsResponse;
import com.sr.app.response.PageResponse;
import com.sr.app.respos.CartRepo;
import com.sr.app.respos.DeliveryAddressRepo;
import com.sr.app.respos.MenuItemRespo;
import com.sr.app.respos.OrderItemRepo;
import com.sr.app.respos.OrderRepo;
import com.sr.app.services.IOrderService;
import com.sr.app.utils.IdGeneration;

@Service
public class OrderServiceimpl implements IOrderService {

	@Autowired
	private MenuItemRespo itemRespo;

	@Autowired
	private OrderRepo orderRepo;
	
	@Autowired
	private CartRepo cartRepo;

	@Autowired
	private OrderItemRepo orderItemRepo;

	@Autowired
	private RazorpayClient razorpayClient;
	
	@Autowired
	private Mapper mapper;

	
	@Autowired
	private DeliveryAddressRepo deliveryAddressRepo;

	private static final Logger logger = LoggerFactory.getLogger(OrderServiceimpl.class);

	@Override
	public OrderResponse create(OrderRequest orderRequest, String userId) {
	
			// Validate items and get complete item details
			List<OrderItem> orderItems = validateAndGetOrderItems(orderRequest.getItems());

			// Calculate total amount
			Double totalAmount = orderItems.stream().mapToDouble(item -> item.getPrice() * item.getQuantity()).sum();

			// Create Razorpay order
			String razorpayOrderId=null;
			try {
				razorpayOrderId = createRazorpayOrder(totalAmount);
			} catch (RazorpayException e) {
				// TODO Auto-generated catch block
				e.printStackTrace();
			}

			// Create and save order
			Orders order = buildOrder(orderRequest, userId, orderItems, totalAmount, razorpayOrderId);
			
			
			Orders savedOrder = orderRepo.save(order);

			// Clear user's cart
//			cartRepo.deleteByUser(userId);

//			logger.info("Order created successfully: {}", savedOrder.getOrderId());

            return new OrderResponse( razorpayOrderId,savedOrder.getOrderId());

		

	}
	
	@CacheEvict(value = { "orderStats" }, allEntries = true)
	@Override
	public void updateStatus(String orderId, String status) {
	
		Orders order = orderRepo.findById(orderId).orElse(null);
		
		if(order ==null)
		{
			throw new AppException("Order Not Found", HttpStatus.NOT_FOUND);
		}
		
         String requestedStatus = null;
		
		if(status!=null)
		{
			if(status.equalsIgnoreCase("pending")) requestedStatus = OrderStatusConstants.PENDING;
			else if(status.equalsIgnoreCase("cancelled")) requestedStatus = OrderStatusConstants.CANCELLED;
			else if(status.equalsIgnoreCase("delivered")) requestedStatus = OrderStatusConstants.DELIVERED;
			else if(status.equalsIgnoreCase("failed")) requestedStatus = OrderStatusConstants.FAILED;
			else if(status.equalsIgnoreCase("paid")) requestedStatus = OrderStatusConstants.PAID;
		}
		
		order.setStatus(requestedStatus);
		
		orderRepo.save(order);
		
	}

	private String createRazorpayOrder(Double totalAmount) throws RazorpayException {
		JSONObject orderRequest = new JSONObject();
		orderRequest.put("amount", totalAmount * 100); // Convert to paise
		orderRequest.put("currency", "INR");
		orderRequest.put("receipt", "order_rcptid_" + System.currentTimeMillis());
		orderRequest.put("payment_capture", 1);

		Order razorpayOrder = razorpayClient.orders.create(orderRequest);
		return razorpayOrder.get("id");
	}

	private List<OrderItem> validateAndGetOrderItems(List<OrderItemRequest> itemRequests) {

		return itemRequests.stream().map(itemRequest -> {
			MenuItems menuItem = itemRespo.findById(itemRequest.getItemId()).orElseThrow(
					() -> new AppException("Menu item not found: " + itemRequest.getItemId(), HttpStatus.NOT_FOUND));

			if (!menuItem.getIsAvailable()) {
				throw new AppException("Menu item not available: " + menuItem.getItemName(), HttpStatus.NOT_FOUND);
			}

			OrderItem orderItem = new OrderItem();
			orderItem.setImageUrl(menuItem.getImgUrl());
			orderItem.setItemId(menuItem.getItemId());
			orderItem.setItemName(menuItem.getItemName());
			orderItem.setOrderItemId(IdGeneration.generateRandomString());
			orderItem.setPrice(menuItem.getPrice());
			orderItem.setQuantity(itemRequest.getQuantity());

			orderItem = orderItemRepo.save(orderItem);

			return orderItem;
		}).collect(Collectors.toList());
	}
	
	private String generateOrderId() {
        return "ORD_" + System.currentTimeMillis() + "_" + 
               UUID.randomUUID().toString().substring(0, 8).toUpperCase();
    }


	private Orders buildOrder(OrderRequest orderRequest, String userId, List<OrderItem> orderItems, Double totalAmount,
			String razorpayOrderId) {
		Orders order = new Orders();
		order.setOrderId(generateOrderId());
		order.setUserId(userId);
		order.setRazorpayOrderId(razorpayOrderId);
		order.setTotalAmount(totalAmount);
		order.setItems(orderItems);

		DeliveryAddress deliveryAddress = new DeliveryAddress();
		deliveryAddress.setAddress(orderRequest.getDeliveryAddress().getAddress());
		deliveryAddress.setCity(orderRequest.getDeliveryAddress().getCity());
		deliveryAddress.setId(IdGeneration.generateRandomString());
		deliveryAddress.setName(orderRequest.getDeliveryAddress().getName());
		deliveryAddress.setPhone(orderRequest.getDeliveryAddress().getPhone());
		deliveryAddress.setPincode(orderRequest.getDeliveryAddress().getPincode());
		
		deliveryAddress = deliveryAddressRepo.save(deliveryAddress);
		
		order.setDeliveryAddress(deliveryAddress);

		return order;
	}

	@Override
	public PageResponse<OrdersDto> getOrders(String userId, Integer page, Integer limit) {
	
		Pageable pageable = PageRequest.of(page, limit);
		
		
		Page<OrdersDto> pageData = orderRepo.findByUser(userId, pageable).map(o->mapper.toDto(o));
		
		return new PageResponse<>(pageData.getContent(), pageData.getNumber(), pageData.getSize(),pageData.getTotalElements(), pageData.getTotalPages(),pageData.isLast());
	}
	
	@Override
	public PageResponse<OrderUserDto> getOrders(Integer page,Integer limit,String status) {
		// TODO Auto-generated method stub
		
		Pageable pageable = PageRequest.of(page, limit,Sort.by("createdAt").descending());
		
		String requestedStatus = null;
		
		if(status!=null)
		{
			if(status.equalsIgnoreCase("pending")) requestedStatus = OrderStatusConstants.PENDING;
			else if(status.equalsIgnoreCase("cancelled")) requestedStatus = OrderStatusConstants.CANCELLED;
			else if(status.equalsIgnoreCase("delivered")) requestedStatus = OrderStatusConstants.DELIVERED;
			else if(status.equalsIgnoreCase("failed")) requestedStatus = OrderStatusConstants.FAILED;
			else if(status.equalsIgnoreCase("paid")) requestedStatus = OrderStatusConstants.PAID;
		}
		
		Page<OrderUserDto> pageData= orderRepo.findByStatus(requestedStatus, pageable).map(o->mapper.toUserOrderDto(o));
		
		return new PageResponse<>(pageData.getContent(), pageData.getNumber(), pageData.getSize(),pageData.getTotalElements(), pageData.getTotalPages(),pageData.isLast());
	}
	
	@Override
	public OrdersDto getOrder(String orderId) {
		
		Orders order = orderRepo.findById(orderId).orElse(null);
		if(order == null)
		{
			throw new AppException("Order Not Found", HttpStatus.NOT_FOUND);
		}
		return mapper.toDto(order);
	}
	
	@Cacheable(value = "orderStats")
	@Override
	public OrdersCountsResponse getOrderStats() {
		
		OrdersCountsResponse response = new OrdersCountsResponse();
		response.setCancelled(orderRepo.countOrderByStatus(OrderStatusConstants.CANCELLED));
		response.setTotalOrders(orderRepo.countOrderByStatus(null));
		response.setDelivered(orderRepo.countOrderByStatus(OrderStatusConstants.DELIVERED));
		response.setFailed(orderRepo.countOrderByStatus(OrderStatusConstants.FAILED));
		response.setPending(orderRepo.countOrderByStatus(OrderStatusConstants.PENDING));
		response.setPreparing(orderRepo.countOrderByStatus(OrderStatusConstants.PREPARING));
		
		return response;
	}
	

}
