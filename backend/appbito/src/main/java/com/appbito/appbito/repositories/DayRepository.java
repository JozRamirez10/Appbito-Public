package com.appbito.appbito.repositories;

import java.util.Optional;

import org.springframework.data.repository.CrudRepository;

import com.appbito.appbito.entities.Day;

public interface DayRepository extends CrudRepository<Day, Long>{
    Optional<Day> findByName(String name);
}
