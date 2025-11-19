package com.sr.app.services;



import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import com.sr.app.exception.AppException;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.HashMap;
import java.util.Map;

@Service
public class CloudinaryService{

    private final Cloudinary cloudinary;

    public CloudinaryService( 
    		@Value("${CLOUDINARY_CLOUD_NAME}") String cloudName,
    		@Value("${CLOUDINARY_API_KEY}") String apiKey, 
    		@Value("${CLOUDINARY_SECRET_KEY}") String apiSecret) {
        Map<String, String> config = new HashMap<>();
        config.put("cloud_name", cloudName);
        config.put("api_key", apiKey);
        config.put("api_secret", apiSecret);
        this.cloudinary = new Cloudinary(config);
    }

    public Map<String, Object> uploadImage(MultipartFile file) {
        try {
            // Only allow image files
            if (!file.getContentType().startsWith("image/")) {
                throw new AppException("Only image files are allowed", HttpStatus.BAD_REQUEST);
            }
            // "image" is the default, but explicit for clarity
            Map<String, Object> options = ObjectUtils.asMap("resource_type", "image");
            return cloudinary.uploader().upload(file.getBytes(), options);
        } catch (IOException e) {
            e.printStackTrace();
            throw new AppException("Failed to upload image", HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    
    
//    public Map<String, Object> uploadPdf(MultipartFile file) {
//    	String fileName = file.getOriginalFilename();
//    	// Remove extension if present, add .pdf explicitly
//    	String publicId = UUID.randomUUID().toString(); // or any unique logic
//    	if (fileName != null && fileName.toLowerCase().endsWith(".pdf")) {
//    	    publicId += ".pdf";
//    	} else {
//    	    publicId = publicId + ".pdf";
//    	}
//
//        try {
//            if (!file.getContentType().equalsIgnoreCase("application/pdf")) {
//                throw new AppException("Only PDF files are allowed", HttpStatus.BAD_REQUEST);
//            }
//            Map<String, Object> options = ObjectUtils.asMap("resource_type", "raw","public_id", publicId);
//            return cloudinary.uploader().upload(file.getBytes(), options);
//        } catch (IOException e) {
//            e.printStackTrace();
//            throw new AppException("Failed to upload PDF", HttpStatus.INTERNAL_SERVER_ERROR);
//        }
//    }

    public boolean deleteFile(String publicId, String resourceType) {
        try {
            Map<String, Object> options = ObjectUtils.asMap("resource_type", resourceType);
            Map result = cloudinary.uploader().destroy(publicId, options);
            return "ok".equals(result.get("result"));
        } catch (IOException e) {
            e.printStackTrace();
            throw new AppException("Failed to delete file", HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}