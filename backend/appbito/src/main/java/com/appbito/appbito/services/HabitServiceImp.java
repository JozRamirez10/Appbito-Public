package com.appbito.appbito.services;

import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.appbito.appbito.entities.Day;
import com.appbito.appbito.entities.Habit;
import com.appbito.appbito.entities.HabitDTO;
import com.appbito.appbito.entities.HabitProgress;
import com.appbito.appbito.entities.User;
import com.appbito.appbito.repositories.DayRepository;
import com.appbito.appbito.repositories.HabitRepository;
import com.appbito.appbito.repositories.UserRepository;


@Service
public class HabitServiceImp implements HabitService{

    private static final SimpleDateFormat DATE_FORMAT = new SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss.SSS'Z'");

    @Autowired
    private HabitRepository repository;

    @Autowired
    private DayRepository dayRepository;

    @Autowired
    private UserRepository userRepository;

    @Override
    @Transactional(readOnly = true)
    public List<HabitDTO> findAll() {
        List<Habit> habits = new ArrayList<>();
        this.repository.findAll().forEach(habits::add);
        return listHabitToListHabitDTO(habits);
    }   

    @Override
    @Transactional(readOnly = true)
    public Optional<HabitDTO> findById(Long id) {
        return this.repository.findById(id)
            .map(this::habitToHabitDTO);
    }

    @Override
    @Transactional
    public HabitDTO save(HabitDTO habitDTO) {
        Habit habit = habitDtoToHabit(habitDTO);
        
        User user = getUserFromHabitDto(habitDTO);
        habit.setUser(user); 
        return habitToHabitDTO(this.repository.save(habit));
    }

    @Override
    @Transactional
    public Optional<HabitDTO> update(HabitDTO habitDTO, Long id) {
        Optional<Habit> habitOptional = this.repository.findById(id);
        if(habitOptional.isPresent()){

            Habit habit = habitDtoToHabit(habitDTO);
            
            Habit habitBD = habitOptional.orElseThrow();

            habitBD.setName(habit.getName());
            habitBD.setDescription(habit.getDescription());
            habitBD.setHour(habit.getHour());
            habitBD.setDays(habit.getDays());

            return Optional.of(this.repository.save(habitBD))
                .map(this::habitToHabitDTO);
        }
        return Optional.empty();
    }

    @Override
    @Transactional
    public void deleteById(Long id) {
        this.repository.deleteById(id);
    }


    @Override
    @Transactional(readOnly = true)
    public List<HabitDTO> findByUserId(Long id) {
        List<Habit> habits = new ArrayList<>();
        this.repository.findByUserId(id).forEach(habits::add);
        return listHabitToListHabitDTO(habits);
    }

    @Override
    @Transactional(readOnly = true)
    public List<HabitDTO> findByToday() {
        String today = LocalDate.now().getDayOfWeek().toString();
        List<Habit> habits = new ArrayList<>();
        this.repository.findByToday(today).forEach(habits::add);
        return listHabitToListHabitDTO(habits);
    }

    @Override
    @Transactional
    public List<HabitDTO> updateBatch(List<HabitDTO> habits) {
        List<Habit> entities = habits.stream()
            .map(habitDTO -> {
                Optional<Habit> habitOptional = this.repository.findById(habitDTO.getId());
                if(habitOptional.isPresent()){
                    Habit habitTransform = habitDtoToHabit(habitDTO);
                    Habit habit = habitOptional.orElseThrow();
                    habit.setProgress(habitTransform.getProgress());
                    return habit;
                }
                return null;
            }).collect(Collectors.toList());
        List<Habit> habitsSave = new ArrayList<>();
        this.repository.saveAll(entities).forEach(habitsSave::add);
        return listHabitToListHabitDTO(habitsSave);
    }
    
    private Habit habitDtoToHabit(HabitDTO habitDTO){
        Habit habit = new Habit();
        habit.setName(habitDTO.getName());
        habit.setDescription(habitDTO.getDescription());
        habit.setHour(habitDTO.getHour());
        
        habit.setDays(
            habitDTO.getDays().stream()
            .map(dayName -> dayRepository.findByName(dayName)
                .orElseThrow( () -> new RuntimeException("Day not found: " + dayName))
            ).collect(Collectors.toList())
        );
        
        if(habitDTO.getProgress() != null){
            List<Date> progressDates = habitDTO.getProgress().stream()
                .map(date -> {
                    try{
                        return DATE_FORMAT.parse(date);
                    } catch(ParseException e){
                        throw new RuntimeException("Invalid date format: " + date, e);
                    }
                })
                .collect(Collectors.toList());
            habit.setProgress(progressDates);
        }

        if(habitDTO.getUserId() != null){
            User user = getUserFromHabitDto(habitDTO);
            habit.setUser(user);
        }

        return habit;
    }

    private HabitDTO habitToHabitDTO(Habit habit){
        HabitDTO habitDTO = new HabitDTO();
        habitDTO.setId(habit.getId());
        habitDTO.setName(habit.getName());
        habitDTO.setDescription(habit.getDescription());
        habitDTO.setHour(habit.getHour());
        
        habitDTO.setDays(
            habit.getDays().stream()
                .map(Day::getName)
                .collect(Collectors.toList())  
        );

        if(habit.getProgress() != null){
            List<String> progresStrings = habit.getProgress().stream()
                .map(date -> DATE_FORMAT.format(date))
                .collect(Collectors.toList());
            habitDTO.setProgress(progresStrings);
        }

        habitDTO.setUserId(habit.getUser().getId());
        
        return habitDTO;
    }

    private List<HabitDTO> listHabitToListHabitDTO(List<Habit> habits){
        return habits.stream()
            .map(this::habitToHabitDTO)
            .collect(Collectors.toList());
    }

    private User getUserFromHabitDto(HabitDTO habitDTO){
        return this.userRepository.findById(habitDTO.getUserId()).orElseThrow(
            () -> new RuntimeException("User not found with id: " + habitDTO.getUserId())
        );
    }

    /* Habit Progress */

    @Override
    @Transactional
    public List<HabitDTO> migrateProgressData() {
        List<Habit> habits = (List<Habit>) repository.findAll();

        for (Habit habit : habits) {
            if(habit.getProgress() != null){

                List<HabitProgress> newProgressesList = new ArrayList<>();

                for (Date oldProgressDate : habit.getProgress()) {
                    HabitProgress progress = new HabitProgress();
                    progress.setHabit(habit);
                    progress.setDate(oldProgressDate);
                    progress.setTimesPerformed(1L);
                    progress.setNote(null);

                    newProgressesList.add(progress);
                }

                habit.getHabitProgress().clear();
                habit.getHabitProgress().addAll(newProgressesList);
            }
        }

        repository.saveAll(habits);

        return listHabitToListHabitDTO(habits);
    }
}
