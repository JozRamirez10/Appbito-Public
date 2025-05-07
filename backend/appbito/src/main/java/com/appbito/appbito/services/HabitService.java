package com.appbito.appbito.services;

import java.util.List;
import java.util.Optional;

import com.appbito.appbito.entities.HabitDTO;

public interface HabitService {
    List<HabitDTO> findAll();
    Optional<HabitDTO> findById(Long id);
    HabitDTO save(HabitDTO habit);
    Optional<HabitDTO> update(HabitDTO habit, Long id);
    void deleteById(Long id);
    
    List<HabitDTO> findByToday();
    List<HabitDTO> findByUserId(Long id);  
    List<HabitDTO> updateBatch(List<HabitDTO> habits);

    List<HabitDTO> migrateProgressData();
}
