package com.sr.app.response;

import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.RequiredArgsConstructor;

@AllArgsConstructor
@RequiredArgsConstructor
@Data
public class PageResponse<T> {
	
	private List<T> content;
    private int number;
    private int pageSize;
    private long totalElements;
    private int totalPages;
    private boolean isLast;

}
