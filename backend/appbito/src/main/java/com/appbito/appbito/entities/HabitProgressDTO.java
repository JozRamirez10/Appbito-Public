package com.appbito.appbito.entities;

public class HabitProgressDTO {

    private Long id;

    private String date;

    private Long timesPerformed;

    private String note;

    private Long habitId;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getDate() {
        return date;
    }

    public void setDate(String date) {
        this.date = date;
    }

    public Long getTimesPerformed() {
        return timesPerformed;
    }

    public void setTimesPerformed(Long timesPerformed) {
        this.timesPerformed = timesPerformed;
    }

    public String getNote() {
        return note;
    }

    public void setNote(String note) {
        this.note = note;
    }

    public Long getHabitId() {
        return habitId;
    }

    public void setHabitId(Long habitId) {
        this.habitId = habitId;
    }

    

}
