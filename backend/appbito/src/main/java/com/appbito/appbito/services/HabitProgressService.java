package com.appbito.appbito.services;

import java.util.Date;
import java.util.List;
import java.util.Optional;

import com.appbito.appbito.entities.HabitProgressDTO;
import com.appbito.appbito.entities.HabitProgressMonthlyDTO;

public interface HabitProgressService {
    List<HabitProgressDTO> findByHabitId(Long idHabit);
    List<HabitProgressDTO> findByHabitIdAndDateBetween(Long habitId, Date startDate, Date endDate);
    Optional<HabitProgressDTO> findById(Long id);
    HabitProgressDTO save(HabitProgressDTO habitProgressDTO);
    Optional<HabitProgressDTO> update(Long id, HabitProgressDTO habitProgressDTO);
    void deleteById(Long id);

    List<HabitProgressMonthlyDTO> getTotalTimesPerformedByMonths(List<Integer> years, List<Long> habitIds);
    int getStreak(Long habitId);
}
