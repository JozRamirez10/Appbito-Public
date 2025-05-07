package com.appbito.appbito;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import com.appbito.appbito.entities.Day;
import com.appbito.appbito.repositories.DayRepository;

@Component
public class DataLoader implements CommandLineRunner{

    @Autowired
    private DayRepository dayRepository;

    @Override 
    public void run(String... args) throws Exception { // Execute at start application
        if(dayRepository.count() == 0){ // Check if day table is empty
            dayRepository.save(new Day("Monday"));
            dayRepository.save(new Day("Tuesday"));
            dayRepository.save(new Day("Wednesday"));
            dayRepository.save(new Day("Thursday"));
            dayRepository.save(new Day("Friday"));
            dayRepository.save(new Day("Saturday"));
            dayRepository.save(new Day("Sunday"));
        }
    }

}
