import { DaysOfWeek } from "../enums/days.enum"
import { Months } from "../enums/months.enum"
import { Habit } from "../models/habit"
import { getDayOfWeek } from "../utils/helpers"

const today = getDayOfWeek();

export const habitData : Habit[] = [
    {
        id : 1,
        name : 'Excercise',
        description: 'Do Excercise',
        hour: '07:00',
        days: [ 
            DaysOfWeek.MONDAY, 
            DaysOfWeek.WEDNESDAY, 
            DaysOfWeek.FRIDAY 
        ],
        progress: [
            new Date(2025, Months.JAN, 11),
            new Date(2025, Months.JAN, 12),
            new Date(2025, Months.JAN, 15),
            new Date(2025, Months.JAN, 16),
        ],
        userId: 1
    },
    {
        id : 2,
        name : 'Study',
        description: 'Study one hour English',
        hour: '12:00',
        days: [ 
            DaysOfWeek.MONDAY,
            DaysOfWeek.TUESDAY, 
            DaysOfWeek.WEDNESDAY, 
            DaysOfWeek.THURSDAY,
            DaysOfWeek.FRIDAY 
        ],
        progress: [],
        userId: 1
    },
    {
        id: 3,
        name: 'Develop',
        description: 'Develop the app',
        hour: '14:00',
        days: [
            today
        ],
        progress: [],
        userId: 1
    }
]