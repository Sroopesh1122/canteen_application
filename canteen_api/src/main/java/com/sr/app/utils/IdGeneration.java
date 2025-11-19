package com.sr.app.utils;


import java.util.UUID;
import java.util.concurrent.ThreadLocalRandom;


import org.springframework.stereotype.Component;


@Component
public class IdGeneration {
	
	public static String generateRandomString() {
	    String uuid = UUID.randomUUID().toString().replace("-", "");
	    long timestamp = System.currentTimeMillis();
	    return uuid + timestamp;
	}
	
	
	public  static long generateUniqueLong() {
        long timestamp = System.currentTimeMillis();
        int randomPart = ThreadLocalRandom.current().nextInt(1000, 9999); // 4-digit random
        return timestamp * 10000L + randomPart;
    }

}