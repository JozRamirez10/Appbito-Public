package com.appbito.appbito.repositories;

import java.util.Date;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.appbito.appbito.entities.HabitProgress;

public interface HabitProgressRepository extends JpaRepository<HabitProgress, Long>{
    List<HabitProgress> findByHabitId(Long id);

    List<HabitProgress> findByHabitIdAndDateBetween(Long habitId, Date startDate, Date endDate);

    @Query("SELECT YEAR(hp.date), MONTH(hp.date), hp.habit.id, SUM(hp.timesPerformed) " +
       "FROM HabitProgress hp " +
       "WHERE YEAR(hp.date) IN (:years) " +
       "AND hp.habit.id IN (:habitIds) " +
       "GROUP BY YEAR(hp.date), MONTH(hp.date), hp.habit.id")
    List<Object[]> getTotalTimesPerformedByMonths(
        @Param("years") List<Integer> years,
        @Param("habitIds") List<Long> habitIds
    );

    @Query("SELECT hp FROM HabitProgress hp WHERE hp.habit.id = :habitId AND hp.timesPerformed >= 1 ORDER BY hp.date ASC")
    List<HabitProgress> findProgressByHabit(@Param("habitId") Long habitId);
}
