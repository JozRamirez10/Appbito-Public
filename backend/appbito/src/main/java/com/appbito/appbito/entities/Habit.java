package com.appbito.appbito.entities;

import java.time.LocalTime;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonIgnore;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.JoinTable;
import jakarta.persistence.ManyToMany;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;

@Entity
@Table(name = "habit")
public class Habit {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "Name is required")
    private String name;

    private String description;

    @JsonFormat(pattern = "HH:mm")
    private LocalTime hour;

    @NotEmpty(message = "Days is requireds")
    @ManyToMany
    @JoinTable(
        name = "habit_days", // intermediate table
        joinColumns = @JoinColumn(name = "habit_id"), // foreign key Habit
        inverseJoinColumns = @JoinColumn(name = "day_id") // foreign key Day
    )
    private List<Day> days;

    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss.SSSXXX")
    private List<Date> progress;

    @OneToMany(
        fetch = FetchType.LAZY,
        mappedBy = "habit", 
        cascade = CascadeType.ALL, 
        orphanRemoval = true
    )
    @JsonIgnore
    private List<HabitProgress> habitProgress = new ArrayList<>();

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    @JsonIgnore
    private User user;

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

    public List<Day> getDays() {
        return days;
    }

    public void setDays(List<Day> days) {
        this.days = days;
    } 

    public List<Date> getProgress() {
        return progress;
    }

    public void setProgress(List<Date> progress) {
        this.progress = progress;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public List<HabitProgress> getHabitProgress() {
        return habitProgress;
    }

    public void setHabitProgress(List<HabitProgress> habitProgress) {
        this.habitProgress = habitProgress;
    }
    
}
