package com.sr.app.request;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class IncomeDto {
    private String month;
    private Double income;
}