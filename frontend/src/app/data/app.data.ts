import { DaysOfWeek } from '../enums/days.enum';

export const appData : any = {
    user: {
        id : 1,
        name: 'Subject',
        lastame: 'Of Test',
        username: 'subjectTest',
        password: '1234',
        email: 'test@email.com',
        date: '01-01-2000',
        habits : [
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
                    {
                        id: 1,
                        day: '11-01-2024',
                        done: true
                    },
                    {
                        id: 2,
                        day: '12-01-2024',
                        done: false
                    }
                ]
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
                progress: [ ]
            }

        ]
    }
}