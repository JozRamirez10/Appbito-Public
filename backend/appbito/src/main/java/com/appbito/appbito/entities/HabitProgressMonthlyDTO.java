package com.appbito.appbito.entities;

public class HabitProgressMonthlyDTO {
    private int year;
    private int month;
    private Long habitId;
    private Long totalTimesPerformed;

    public HabitProgressMonthlyDTO(int year, int month, Long habitId, Long totalTimesPerformed) {
        this.year = year;
        this.month = month;
        this.habitId = habitId;
        this.totalTimesPerformed = totalTimesPerformed;
    }

    public int getYear() {
        return year;
    }

    public void setYear(int year) {
        this.year = year;
    }

    public int getMonth() {
        return month;
    }

    public void setMonth(int month) {
        this.month = month;
    }

    public Long getHabitId() {
        return habitId;
    }

    public void setHabitId(Long habitId) {
        this.habitId = habitId;
    }

    public Long getTotalTimesPerformed() {
        return totalTimesPerformed;
    }

    public void setTotalTimesPerformed(Long totalTimesPerformed) {
        this.totalTimesPerformed = totalTimesPerformed;
    }
}
