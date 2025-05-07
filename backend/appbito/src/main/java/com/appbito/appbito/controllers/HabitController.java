package com.appbito.appbito.controllers;

import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
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
import org.springframework.web.bind.annotation.RestController;

import com.appbito.appbito.entities.HabitDTO;
import com.appbito.appbito.services.HabitService;
import com.appbito.appbito.services.UserService;

import jakarta.validation.Valid;

@CrossOrigin(originPatterns = {"http://localhost:4200"})
@RestController
@RequestMapping("/api/habits")
public class HabitController {

    @Autowired
    private HabitService service;

    @Autowired
    private UserService userService;

    @GetMapping 
    public List<HabitDTO> list(){
        return this.service.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> byId(@PathVariable Long id){
        Optional<HabitDTO> habitOptional = this.service.findById(id);
        if(habitOptional.isPresent()){
            return ResponseEntity.status(HttpStatus.OK).body(habitOptional.orElseThrow());
        }
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Collections.singletonMap("Error", "Habit not found"));
    }

    @GetMapping("/user/{id}")
    public ResponseEntity<?> byUserId(@PathVariable Long id){
        if(this.userService.existsById(id)){
            return ResponseEntity.status(HttpStatus.OK).body(this.service.findByUserId(id));
        }
        return ResponseEntity.notFound().build();
    }

    @GetMapping("/today")
    public List<HabitDTO> byToday(){
        return this.service.findByToday();
    }

    @PostMapping
    public ResponseEntity<?> create(@Valid @RequestBody HabitDTO habit, BindingResult result){
        if(result.hasErrors()){
            return validation(result);
        }

        if(habit.getUserId() == null){
            return ResponseEntity.badRequest().body(Collections.singletonMap("Error", "User ID is required"));
        }

        try{
            return ResponseEntity.status(HttpStatus.CREATED).body(this.service.save(habit));
        } catch(RuntimeException e) {
            return ResponseEntity.badRequest().body(Collections.singletonMap("Error", e.getMessage()));
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> update(@Valid @RequestBody HabitDTO habit, BindingResult result, @PathVariable Long id){
        if(result.hasErrors()){
            return validation(result);
        }

        if(habit.getUserId() == null){
            return ResponseEntity.badRequest().body(Collections.singletonMap("Error", "User ID is required"));
        }

        try{
            Optional<HabitDTO> habitOptional = this.service.update(habit, id);
            if(habitOptional.isPresent()){
                return ResponseEntity.ok(habitOptional.orElseThrow());
            }
            return ResponseEntity.notFound().build();
        }catch(RuntimeException e) {
            return ResponseEntity.badRequest().body(Collections.singletonMap("Error", e.getMessage()));
        }
    }

    @PutMapping("/batch")
    public ResponseEntity<?> updateBatch(@Valid @RequestBody List<HabitDTO> habits, BindingResult result){
        if(result.hasErrors()){
            return validation(result);
        }
        return ResponseEntity.ok(this.service.updateBatch(habits));

    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@PathVariable Long id){
        Optional<HabitDTO> habitOptional = this.service.findById(id);
        if(habitOptional.isPresent()){
            this.service.deleteById(id);
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.notFound().build();
    }

    @GetMapping("/migrate")
    public List<HabitDTO> migrate(){
        return this.service.migrateProgressData();
    }

    private ResponseEntity<?> validation(BindingResult result){
        Map<String, String> errors = new HashMap<>();
        result.getFieldErrors().forEach(error -> {
            errors.put(error.getField(), error.getDefaultMessage());
        });
        return ResponseEntity.badRequest().body(errors);
    }

}
