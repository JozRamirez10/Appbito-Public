package com.appbito.appbito.entities;

import java.time.LocalTime;
import java.util.List;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonIgnore;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;

public class HabitDTO {
    
    private Long id;

    @NotBlank(message = "Name is required")
    private String name;

    private String description;

    @JsonFormat(pattern = "HH:mm")
    private LocalTime hour;

    @NotEmpty(message = "Days are required")
    private List<String> days;

    @JsonIgnore
    private List<String> progress;

    @JsonIgnore
    private List<HabitProgressDTO> habitProgress;

    private Long userId;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public LocalTime getHour() {
        return hour;
    }

    public void setHour(LocalTime hour) {
        this.hour = hour;
    }

    public List<String> getDays() {
        return days;
    }

    public void setDays(List<String> days) {
        this.days = days;
    }

    public List<String> getProgress() {
        return progress;
    }

    public void setProgress(List<String> progress) {
        this.progress = progress;
    }

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public List<HabitProgressDTO> getHabitProgress() {
        return habitProgress;
    }

    public void setHabitProgress(List<HabitProgressDTO> habitProgress) {
        this.habitProgress = habitProgress;
    }
    
}
