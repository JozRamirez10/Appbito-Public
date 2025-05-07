package com.appbito.appbito.controllers;

import java.util.Collections;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.appbito.appbito.entities.HabitProgressDTO;
import com.appbito.appbito.entities.HabitProgressMonthlyDTO;
import com.appbito.appbito.services.HabitProgressService;

import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.RequestParam;


@RestController
@RequestMapping("/api/habitsProgress")
public class HabitProgressController {

    @Autowired
    private HabitProgressService service;

    @GetMapping("/habit/{id}")
    public List<HabitProgressDTO> byIdHabit(@PathVariable Long id){
        return this.service.findByHabitId(id);
    }

    @GetMapping("/habit/{id}/streak")
    public int getHabitStreak(@PathVariable Long id){
        return this.service.getStreak(id);
    }
    
    @GetMapping("/habit/{id}/range")
    public List<HabitProgressDTO> byIdHabitAndDateRange(@PathVariable Long id, 
        @RequestParam @DateTimeFormat(pattern = "yyyy-MM-dd") Date startDate,
        @RequestParam @DateTimeFormat(pattern = "yyyy-MM-dd") Date endDate) {
        return this.service.findByHabitIdAndDateBetween(id, startDate, endDate);
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> byId(@PathVariable Long id){
        Optional<HabitProgressDTO> habitProgressOptional = this.service.findById(id);
        if(habitProgressOptional.isPresent()){
            return ResponseEntity.status(HttpStatus.OK).body(habitProgressOptional.orElseThrow());
        }
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Collections.singletonMap("Error", "Habit Progress not found"));
    }

    @GetMapping("/monthly")
    public List<HabitProgressMonthlyDTO> getTotalTimesPerformedByMonths(
        @RequestParam List<Integer> years,
        @RequestParam List<Long> habitIds
    ){
        return this.service.getTotalTimesPerformedByMonths(years, habitIds);
    }

    @PostMapping
    public ResponseEntity<?> create(@Valid @RequestBody HabitProgressDTO habitProgressDTO, BindingResult result){
        if(result.hasErrors()){
            return validation(result);
        }
        
        if(habitProgressDTO.getHabitId() == null){
            return ResponseEntity.badRequest().body(Collections.singletonMap("Error", "Habit ID is required"));
        }

        try{
            return ResponseEntity.status(HttpStatus.CREATED).body(this.service.save(habitProgressDTO));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Collections.singletonMap("Error", e.getMessage()));
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> update(@Valid @RequestBody HabitProgressDTO habitProgressDTO, BindingResult result, @PathVariable Long id){
        if(result.hasErrors()){
            return validation(result);
        }
        
        if(habitProgressDTO.getHabitId() == null){
            return ResponseEntity.badRequest().body(Collections.singletonMap("Error", "Habit ID is required"));
        }

        try{
            Optional<HabitProgressDTO> habitProgresOptional = this.service.update(id, habitProgressDTO);
            if(habitProgresOptional.isPresent()){
                return ResponseEntity.ok(habitProgresOptional.orElseThrow());
            }
            return ResponseEntity.notFound().build();
        } catch (RuntimeException e){
            return ResponseEntity.badRequest().body(Collections.singletonMap("Error", e.getMessage()));
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@PathVariable Long id){
        Optional<HabitProgressDTO> habitProgressOptional = this.service.findById(id);
        if(habitProgressOptional.isPresent()){
            this.service.deleteById(id);
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.notFound().build();
    }

    private ResponseEntity<?> validation(BindingResult result){
        Map<String, String> errors = new HashMap<>();
        result.getFieldErrors().forEach(error -> {
            errors.put(error.getField(), error.getDefaultMessage());
        });
        return ResponseEntity.badRequest().body(errors);
    }

}
