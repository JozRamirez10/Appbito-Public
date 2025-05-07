package com.appbito.appbito.repositories;

import java.util.List;

import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.CrudRepository;
import org.springframework.data.repository.query.Param;

import com.appbito.appbito.entities.Habit;

public interface HabitRepository extends CrudRepository<Habit, Long>{

    @Query("SELECT h FROM Habit h JOIN h.days d WHERE d.name = :dayName")
    List<Habit> findByToday(@Param("dayName") String dayName);

    @Query("SELECT h FROM Habit h WHERE h.user.id = :userId")
    List<Habit> findByUserId(@Param("userId") Long userId);

    @Modifying
    @Query("DELETE FROM HabitProgress h WHERE h.id = :habitProgressId")
    void deleteHabitProgressById(@Param("habitProgressId") Long habitProgressId);

}
