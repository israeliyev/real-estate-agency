package io.mingachevir.mingachevirrealestateserver.service.impl;

import io.mingachevir.mingachevirrealestateserver.service.FileService;
import io.mingachevir.mingachevirrealestateserver.util.CustomServiceException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.DeleteObjectRequest;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;

import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.net.URLDecoder;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.Objects;
import java.util.Set;

@Service
@RequiredArgsConstructor
@Slf4j
public class FileServiceImpl implements FileService {

    @Value("${application.bucket.name}")
    private String bucketName;

    @Value("${cloud.aws.region.static}")
    private String region;

    private final S3Client s3Client;

    private static final String UPLOAD_DIR = "/uploads/";
    private static final long MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5 MB
    private static final long MAX_VIDEO_SIZE = 50 * 1024 * 1024; // 50 MB
    private static final Set<String> VALID_TYPES = Set.of(
            // Images
            "image/png", "image/jpeg", "image/jpg",
            "image/heic",
            // Videos
            "video/mp4", "video/mpeg", "video/quicktime",
            "video/webm", "video/ogg"
    );

    @Override
    public ResponseEntity<String> uploadFile(MultipartFile file) {
        log.info("Uploading file: {} (size: {} bytes, type: {})",
                file.getOriginalFilename(), file.getSize(), file.getContentType());
        validateFile(file);

        try {
            String fileName = System.currentTimeMillis() + "_" + file.getOriginalFilename();

            PutObjectRequest putObjectRequest = PutObjectRequest.builder()
                    .bucket(bucketName)
                    .key(fileName)
                    .build();

            s3Client.putObject(putObjectRequest, RequestBody.fromInputStream(file.getInputStream(), file.getSize()));
            String encodedKey = URLEncoder.encode(fileName, StandardCharsets.UTF_8);
            String prefix = "https://" + bucketName + ".s3." + region + ".amazonaws.com/";
            String fileUrl = String.format("%s%s", prefix, encodedKey);
            return ResponseEntity.ok(fileUrl);
        } catch (Exception e) {
            log.error("Upload error: {}", e.getMessage(), e);
            throw new CustomServiceException("Error saving image", e.getMessage());
        }
    }

    @Override
    public ResponseEntity<Void> deleteFile(String filePath) {
        if (filePath == null || filePath.isBlank()) {
            return ResponseEntity.badRequest().build();
        }
        try {
            String prefix = "https://" + bucketName + ".s3." + region + ".amazonaws.com/";
            if (!filePath.startsWith(prefix)) {
                return ResponseEntity.badRequest().build();
            }
            String key = filePath.substring(prefix.length());
            String decodedFileName = URLDecoder.decode(key, StandardCharsets.UTF_8);
            DeleteObjectRequest deleteObjectRequest = DeleteObjectRequest.builder()
                    .bucket(bucketName)
                    .key(decodedFileName)
                    .build();

            s3Client.deleteObject(deleteObjectRequest);
            return ResponseEntity.ok().build();
        } catch (software.amazon.awssdk.core.exception.SdkClientException e) {
            log.error("Failed to delete S3 object: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        } catch (Exception e) {
            log.error("Error processing delete request: {}", e.getMessage(), e);
            return ResponseEntity.badRequest().build();
        }
    }

    private void validateFile(MultipartFile file) {
        if (file.isEmpty()) {
            throw new CustomServiceException("File is empty", "No content provided");
        }

        String contentType = file.getContentType();
        if (contentType == null || !VALID_TYPES.contains(contentType)) {
            throw new CustomServiceException("Invalid file type", "Only specific image or video formats are allowed");
        }

        long fileSize = file.getSize();
        if (contentType.startsWith("image/") && fileSize > MAX_IMAGE_SIZE) {
            throw new CustomServiceException("Image too large", "Max image size is 5MB");
        }
        if (contentType.startsWith("video/") && fileSize > MAX_VIDEO_SIZE) {
            throw new CustomServiceException("Video too large", "Max video size is 50MB");
        }
    }


    private File convertMultiPartFileToFile(MultipartFile file) {
        File convertedFile = new File(Objects.requireNonNull(file.getOriginalFilename()));
        try (FileOutputStream fos = new FileOutputStream(convertedFile)) {
            fos.write(file.getBytes());
        } catch (IOException e) {
            log.error("Error converting multipartFile to file", e);
        }
        return convertedFile;
    }
}
