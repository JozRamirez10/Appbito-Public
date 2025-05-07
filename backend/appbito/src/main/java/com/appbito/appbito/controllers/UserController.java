package com.appbito.appbito.controllers;

import java.awt.image.BufferedImage;
import java.io.File;
import java.io.IOException;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import javax.imageio.ImageIO;

import org.imgscalr.Scalr;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.appbito.appbito.entities.UpdatePasswordRequest;
import com.appbito.appbito.entities.User;
import com.appbito.appbito.entities.UserDTO;
import com.appbito.appbito.services.UserService;

import jakarta.validation.Valid;

@CrossOrigin(originPatterns = {"http://localhost:4200"})
@RestController
@RequestMapping("/api/users")
public class UserController {

    @Value("${app.image-dir}")
    private String IMAGE_DIR;

    @Autowired
    private UserService service;

    @GetMapping
    public List<User> list(){
        return this.service.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> byId(@PathVariable Long id){
        Optional<UserDTO> userOptional = this.service.findById(id);
        if(userOptional.isPresent()){
            return ResponseEntity.status(HttpStatus.OK).body(userOptional.orElseThrow());
        }
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Collections.singletonMap("Error", "User not found"));
    }

    @PostMapping
    public ResponseEntity<?> create(@Valid @RequestBody User user, BindingResult result){
        if(result.hasErrors()){
            return validation(result);
        }

        if(this.service.existsByEmail(user.getEmail())){
            return ResponseEntity.badRequest().body(Map.of("email", "Email already exists"));
        }

        return ResponseEntity.status(HttpStatus.CREATED).body(this.service.save(user));
    }

    @GetMapping("/image/{filename}")
    public ResponseEntity<?> getImage(@PathVariable String filename){
        try{
            Path imagePath = Paths.get(IMAGE_DIR).resolve(filename).normalize();
            Resource resource = new UrlResource(imagePath.toUri());

            if(!resource.exists()){
                return ResponseEntity.notFound().build();
            }

            return ResponseEntity.ok()
                .contentType(MediaType.IMAGE_JPEG)
                .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + filename + "\"")
                .body(resource);
        }catch(Exception e){
            return ResponseEntity.status(500).body(null);
        }
    }

    @SuppressWarnings("null")
    @PostMapping("/image")
    public ResponseEntity<?> uploadProfileImage(@RequestParam("image") MultipartFile file, @RequestParam("email") String email){
        try{

            File dir = new File(IMAGE_DIR);
            if(!dir.exists()){
                dir.mkdirs();
            }

            String contentType = file.getContentType();
            if(!contentType.equals("image/jpeg") && !contentType.equals("image/png")) {
                return ResponseEntity.badRequest().body(Map.of("error", "Format not allowed"));
            }

            BufferedImage originalImage = ImageIO.read(file.getInputStream());

            BufferedImage resizedImage = Scalr.resize(originalImage, 200);

            String filename = email.replaceAll("[^a-zA-Z0-9]", "_") + ".jpg";
            File outputFile = new File(IMAGE_DIR + filename);

            ImageIO.write(resizedImage, "jpg", outputFile);

            if (!outputFile.exists()) {
                return ResponseEntity.status(500).body("Error processing image");
            }

            String imagePath = filename;

            this.service.saveImage(email, imagePath);

            return ResponseEntity.ok().body(Map.of("image", imagePath));
        }catch(IOException e){
            return ResponseEntity.status(500).body("Error processing image");
        }catch(Exception e){
            return ResponseEntity.status(500).body("Unexpected error");
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> update(@Valid @RequestBody UserDTO user, BindingResult result, @PathVariable Long id){
        if(result.hasErrors()){
            return validation(result);
        }

        if(!this.service.existsByEmailAndId(user.getEmail(), user.getId()) 
                && this.service.existsByEmail(user.getEmail())){
            return ResponseEntity.badRequest().body(Map.of("email", "Email already exists"));
        }

        Optional<UserDTO> userOptional = this.service.update(user, id);
        if(userOptional.isPresent()){
            return ResponseEntity.ok(userOptional.orElseThrow());
        }
        
        return ResponseEntity.notFound().build();
    }

    @PutMapping("/password/{id}")
    public ResponseEntity<?> updatePassword(@Valid @RequestBody UpdatePasswordRequest request, BindingResult result, @PathVariable Long id){
        if(result.hasErrors()){
            return validation(result);
        }

        Optional<UserDTO> userOptional = this.service.updatePassword(id, request.getOldPassword(), request.getNewPassword());
        if(userOptional.isPresent()){
            return ResponseEntity.ok(userOptional.orElseThrow());
        }

        return ResponseEntity.badRequest().body(Map.of("error", "Password incorrect"));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@PathVariable Long id){
        Optional<UserDTO> userOptional = this.service.findById(id);
        if(userOptional.isPresent()){
            this.service.deleteById(id);
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.notFound().build();
    }

    @DeleteMapping("/password/{id}")
    public ResponseEntity<?> confirmDelete(@PathVariable Long id, @RequestBody Map<String, String> request){
        String password = request.get("password");
        try{
            Optional<User> user = this.service.findByIdAndPassword(id, password);
            if(user.isPresent()){
                this.service.deleteById(id);
                return ResponseEntity.noContent().build();
            }
            return ResponseEntity.notFound().build();
        }catch(IllegalArgumentException e){
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    private ResponseEntity<?> validation(BindingResult result){
        Map<String, String> errors = new HashMap<>();
        result.getFieldErrors().forEach(error -> {
            errors.put(error.getField(), error.getDefaultMessage());
        });
        return ResponseEntity.badRequest().body(errors);
    }

}
